public with sharing class qfrFormTestController {
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper saveFormData(String recordId, String formData) {
        try {
            Map<String, Object> dataMap = (Map<String, Object>) JSON.deserializeUntyped(formData);
            
            // Create or update QFR record
            QFR_Form__c qfrRecord;
            if (String.isNotBlank(recordId)) {
                qfrRecord = [SELECT Id FROM QFR_Form__c WHERE Id = :recordId LIMIT 1];
            } else {
                qfrRecord = new QFR_Form__c();
            }
            
            // Map form data to Salesforce fields
            mapFormDataToRecord(qfrRecord, dataMap);
            
            upsert qfrRecord;
            
            return new ResponseWrapper(true, 'Data saved successfully', qfrRecord.Id);
            
        } catch (Exception e) {
            System.debug('Error saving form data: ' + e.getMessage());
            return new ResponseWrapper(false, 'Failed to save data: ' + e.getMessage(), null);
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper loadFormData(String recordId) {
        try {
            if (String.isBlank(recordId)) {
                return new ResponseWrapper(true, 'No record ID provided', new Map<String, Object>());
            }
            
            QFR_Form__c qfrRecord = [
                SELECT Id, Organization_Name__c, NAPS_ID__c, Contact_Name__c, 
                       Contact_Position__c, Contact_Phone__c, Contact_Email__c,
                       Solvency_Concern__c, Solvency_Future__c, Operational_Loss__c,
                       Workforce_Type__c, Business_Structure_Data__c, Labour_Costs_Data__c,
                       Current_Page__c, Form_Data_JSON__c
                FROM QFR_Form__c 
                WHERE Id = :recordId 
                LIMIT 1
            ];
            
            Map<String, Object> formData = buildFormDataMap(qfrRecord);
            
            // Get uploaded files
            List<ContentDocumentLink> docLinks = [
                SELECT ContentDocumentId, ContentDocument.Title, ContentDocument.FileExtension,
                       ContentDocument.ContentSize
                FROM ContentDocumentLink 
                WHERE LinkedEntityId = :recordId
            ];
            
            List<Map<String, Object>> uploadedFiles = new List<Map<String, Object>>();
            for (ContentDocumentLink link : docLinks) {
                Map<String, Object> fileData = new Map<String, Object>();
                fileData.put('id', link.ContentDocumentId);
                fileData.put('name', link.ContentDocument.Title);
                fileData.put('size', formatFileSize(link.ContentDocument.ContentSize));
                fileData.put('documentId', link.ContentDocumentId);
                uploadedFiles.add(fileData);
            }
            
            formData.put('uploadedFiles', uploadedFiles);
            
            return new ResponseWrapper(true, 'Data loaded successfully', formData);
            
        } catch (Exception e) {
            System.debug('Error loading form data: ' + e.getMessage());
            return new ResponseWrapper(false, 'Failed to load data: ' + e.getMessage(), null);
        }
    }
    
    @AuraEnabled
    public static ResponseWrapper uploadDocument(String recordId, String documentId, String category, String type) {
        try {
            // Create document metadata record if needed
            Document_Metadata__c docMeta = new Document_Metadata__c();
            docMeta.QFR_Form__c = recordId;
            docMeta.Document_ID__c = documentId;
            docMeta.Category__c = category;
            docMeta.Type__c = type;
            docMeta.Upload_Date__c = System.now();
            
            insert docMeta;
            
            return new ResponseWrapper(true, 'Document uploaded successfully', docMeta.Id);
            
        } catch (Exception e) {
            System.debug('Error uploading document: ' + e.getMessage());
            return new ResponseWrapper(false, 'Failed to upload document: ' + e.getMessage(), null);
        }
    }
    
    @AuraEnabled
    public static ResponseWrapper deleteDocument(String documentId) {
        try {
            // Delete the ContentDocument
            ContentDocument doc = [SELECT Id FROM ContentDocument WHERE Id = :documentId LIMIT 1];
            delete doc;
            
            // Delete associated metadata
            List<Document_Metadata__c> metaRecords = [
                SELECT Id FROM Document_Metadata__c WHERE Document_ID__c = :documentId
            ];
            if (!metaRecords.isEmpty()) {
                delete metaRecords;
            }
            
            return new ResponseWrapper(true, 'Document deleted successfully', null);
            
        } catch (Exception e) {
            System.debug('Error deleting document: ' + e.getMessage());
            return new ResponseWrapper(false, 'Failed to delete document: ' + e.getMessage(), null);
        }
    }
    
    @AuraEnabled
    public static ResponseWrapper submitQFRForm(String recordId, String formData) {
        try {
            // Save final form data
            ResponseWrapper saveResult = saveFormData(recordId, formData);
            if (!saveResult.success) {
                return saveResult;
            }
            
            // Update submission status
            QFR_Form__c qfrRecord = [SELECT Id FROM QFR_Form__c WHERE Id = :recordId LIMIT 1];
            qfrRecord.Status__c = 'Submitted';
            qfrRecord.Submission_Date__c = System.now();
            
            update qfrRecord;
            
            // Send notification email (if required)
            sendSubmissionNotification(qfrRecord.Id);
            
            return new ResponseWrapper(true, 'QFR Form submitted successfully', qfrRecord.Id);
            
        } catch (Exception e) {
            System.debug('Error submitting QFR form: ' + e.getMessage());
            return new ResponseWrapper(false, 'Failed to submit form: ' + e.getMessage(), null);
        }
    }
    
    // Helper methods
    private static void mapFormDataToRecord(QFR_Form__c record, Map<String, Object> dataMap) {
        // Map basic form fields
        if (dataMap.containsKey('organizationName')) {
            record.Organization_Name__c = (String) dataMap.get('organizationName');
        }
        if (dataMap.containsKey('napsId')) {
            record.NAPS_ID__c = (String) dataMap.get('napsId');
        }
        if (dataMap.containsKey('contactName')) {
            record.Contact_Name__c = (String) dataMap.get('contactName');
        }
        if (dataMap.containsKey('contactPosition')) {
            record.Contact_Position__c = (String) dataMap.get('contactPosition');
        }
        if (dataMap.containsKey('contactPhone')) {
            record.Contact_Phone__c = (String) dataMap.get('contactPhone');
        }
        if (dataMap.containsKey('contactEmail')) {
            record.Contact_Email__c = (String) dataMap.get('contactEmail');
        }
        if (dataMap.containsKey('solvencyConcern')) {
            record.Solvency_Concern__c = (String) dataMap.get('solvencyConcern');
        }
        if (dataMap.containsKey('solvencyFuture')) {
            record.Solvency_Future__c = (String) dataMap.get('solvencyFuture');
        }
        if (dataMap.containsKey('operationalLoss')) {
            record.Operational_Loss__c = (String) dataMap.get('operationalLoss');
        }
        if (dataMap.containsKey('workforceType')) {
            record.Workforce_Type__c = (String) dataMap.get('workforceType');
        }
        if (dataMap.containsKey('currentPage')) {
            record.Current_Page__c = (Decimal) dataMap.get('currentPage');
        }
        
        // Store complex data as JSON
        if (dataMap.containsKey('businessStructure')) {
            record.Business_Structure_Data__c = JSON.serialize(dataMap.get('businessStructure'));
        }
        if (dataMap.containsKey('labourCosts')) {
            record.Labour_Costs_Data__c = JSON.serialize(dataMap.get('labourCosts'));
        }
        
        // Store entire form data as JSON for backup
        record.Form_Data_JSON__c = JSON.serialize(dataMap);
    }
    
    private static Map<String, Object> buildFormDataMap(QFR_Form__c record) {
        Map<String, Object> formData = new Map<String, Object>();
        
        // Basic fields
        formData.put('organizationName', record.Organization_Name__c);
        formData.put('napsId', record.NAPS_ID__c);
        formData.put('contactName', record.Contact_Name__c);
        formData.put('contactPosition', record.Contact_Position__c);
        formData.put('contactPhone', record.Contact_Phone__c);
        formData.put('contactEmail', record.Contact_Email__c);
        formData.put('solvencyConcern', record.Solvency_Concern__c);
        formData.put('solvencyFuture', record.Solvency_Future__c);
        formData.put('operationalLoss', record.Operational_Loss__c);
        formData.put('workforceType', record.Workforce_Type__c);
        formData.put('currentPage', record.Current_Page__c);
        
        // Complex data from JSON fields
        if (String.isNotBlank(record.Business_Structure_Data__c)) {
            Object businessStructureData = JSON.deserializeUntyped(record.Business_Structure_Data__c);
            formData.put('businessStructure', businessStructureData);
        }
        
        if (String.isNotBlank(record.Labour_Costs_Data__c)) {
            Object labourCostsData = JSON.deserializeUntyped(record.Labour_Costs_Data__c);
            formData.put('labourCosts', labourCostsData);
        }
        
        return formData;
    }
    
    private static String formatFileSize(Long bytes) {
        if (bytes == 0) return '0 Bytes';
        
        List<String> sizes = new List<String>{'Bytes', 'KB', 'MB', 'GB'};
        Integer i = (Integer) Math.floor(Math.log(bytes) / Math.log(1024));
        
        Decimal size = bytes / Math.pow(1024, i);
        return size.setScale(2) + ' ' + sizes[i];
    }
    
    private static void sendSubmissionNotification(String recordId) {
        // Implementation for sending notification emails
        // This would typically involve creating and sending email templates
        try {
            // Create email notification logic here
            System.debug('Submission notification sent for record: ' + recordId);
        } catch (Exception e) {
            System.debug('Failed to send notification: ' + e.getMessage());
        }
    }
    
    // Response wrapper class
    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Object data;
        @AuraEnabled public List<String> errors;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = new List<String>();
        }
    }
}
