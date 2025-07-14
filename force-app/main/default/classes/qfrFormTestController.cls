public with sharing class qfrFormTestController {
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper saveFormData(String recordId, String formData) {
        try {
            // Parse the form data
            Object tempData = JSON.deserializeUntyped(formData);
            Map<String, Object> dataMap = (Map<String, Object>) tempData;
            
            // Create or update QFR record
            QFR_Submission__c qfrRecord = getOrCreateQFRRecord(recordId);
            
            // Update fields based on form data
            updateQFRFields(qfrRecord, dataMap);
            
            upsert qfrRecord;
            
            return new ResponseWrapper(true, 'Form data saved successfully', qfrRecord.Id);
            
        } catch (Exception e) {
            System.debug('Error saving form data: ' + e.getMessage());
            return new ResponseWrapper(false, 'Failed to save form data: ' + e.getMessage(), null);
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper loadFormData(String recordId) {
        try {
            QFR_Submission__c qfrRecord = [
                SELECT Id, Name, Form_Data__c, Contact_Name__c, Contact_Email__c, 
                       Contact_Phone__c, Contact_Position__c, Organization_Name__c,
                       NAPS_ID__c, Solvency_Concern__c, Solvency_Future__c, 
                       Operational_Loss__c, Workforce_Engagement__c, Current_Page__c
                FROM QFR_Submission__c 
                WHERE Id = :recordId 
                LIMIT 1
            ];
            
            Map<String, Object> formData = new Map<String, Object>();
            
            // Map database fields to form data
            formData.put('contactName', qfrRecord.Contact_Name__c);
            formData.put('contactEmail', qfrRecord.Contact_Email__c);
            formData.put('contactPhone', qfrRecord.Contact_Phone__c);
            formData.put('contactPosition', qfrRecord.Contact_Position__c);
            formData.put('organizationName', qfrRecord.Organization_Name__c);
            formData.put('napsId', qfrRecord.NAPS_ID__c);
            formData.put('solvencyConcern', qfrRecord.Solvency_Concern__c);
            formData.put('solvencyFuture', qfrRecord.Solvency_Future__c);
            formData.put('operationalLoss', qfrRecord.Operational_Loss__c);
            formData.put('workforceEngagement', qfrRecord.Workforce_Engagement__c);
            formData.put('currentPage', qfrRecord.Current_Page__c);
            
            // Parse complex form data if exists
            if (String.isNotBlank(qfrRecord.Form_Data__c)) {
                Object tempComplexData = JSON.deserializeUntyped(qfrRecord.Form_Data__c);
                Map<String, Object> complexData = (Map<String, Object>) tempComplexData;
                formData.putAll(complexData);
            }
            
            return new ResponseWrapper(true, 'Form data loaded successfully', formData);
            
        } catch (Exception e) {
            System.debug('Error loading form data: ' + e.getMessage());
            return new ResponseWrapper(false, 'Failed to load form data: ' + e.getMessage(), null);
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper uploadDocument(String recordId, String fileName, String fileId, String category, String type) {
        try {
            // Create document record
            QFR_Document__c docRecord = new QFR_Document__c();
            docRecord.QFR_Submission__c = recordId;
            docRecord.File_Name__c = fileName;
            docRecord.Content_Document_Id__c = fileId;
            docRecord.Category__c = category;
            docRecord.Type__c = type;
            docRecord.Upload_Date__c = System.now();
            
            insert docRecord;
            
            return new ResponseWrapper(true, 'Document uploaded successfully', docRecord.Id);
            
        } catch (Exception e) {
            System.debug('Error uploading document: ' + e.getMessage());
            return new ResponseWrapper(false, 'Failed to upload document: ' + e.getMessage(), null);
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper getUploadedFiles(String recordId) {
        try {
            List<QFR_Document__c> documents = [
                SELECT Id, File_Name__c, Category__c, Type__c, Upload_Date__c, 
                       Content_Document_Id__c, File_Size__c
                FROM QFR_Document__c 
                WHERE QFR_Submission__c = :recordId 
                ORDER BY Upload_Date__c DESC
            ];
            
            List<Map<String, Object>> fileList = new List<Map<String, Object>>();
            
            for (QFR_Document__c doc : documents) {
                Map<String, Object> fileInfo = new Map<String, Object>();
                fileInfo.put('id', doc.Content_Document_Id__c);
                fileInfo.put('name', doc.File_Name__c);
                fileInfo.put('category', doc.Category__c);
                fileInfo.put('type', doc.Type__c);
                fileInfo.put('uploadDate', doc.Upload_Date__c);
                fileInfo.put('size', formatFileSize(doc.File_Size__c));
                fileList.add(fileInfo);
            }
            
            return new ResponseWrapper(true, 'Files loaded successfully', fileList);
            
        } catch (Exception e) {
            System.debug('Error loading uploaded files: ' + e.getMessage());
            return new ResponseWrapper(false, 'Failed to load uploaded files: ' + e.getMessage(), null);
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper submitQFRForm(String recordId, String formData) {
        try {
            // Parse form data
            Object tempData = JSON.deserializeUntyped(formData);
            Map<String, Object> dataMap = (Map<String, Object>) tempData;
            
            // Get QFR record
            QFR_Submission__c qfrRecord = [
                SELECT Id, Name, Status__c 
                FROM QFR_Submission__c 
                WHERE Id = :recordId 
                LIMIT 1
            ];
            
            // Validate submission
            ValidationResult validation = validateSubmission(dataMap);
            if (!validation.isValid) {
                return new ResponseWrapper(false, validation.errorMessage, null);
            }
            
            // Update record with final data
            updateQFRFields(qfrRecord, dataMap);
            qfrRecord.Status__c = 'Submitted';
            qfrRecord.Submission_Date__c = System.now();
            
            update qfrRecord;
            
            // Send notification email (optional)
            sendSubmissionNotification(qfrRecord);
            
            return new ResponseWrapper(true, 'QFR Form submitted successfully', qfrRecord.Id);
            
        } catch (Exception e) {
            System.debug('Error submitting QFR form: ' + e.getMessage());
            return new ResponseWrapper(false, 'Failed to submit QFR form: ' + e.getMessage(), null);
        }
    }
    
    // Helper Methods
    private static QFR_Submission__c getOrCreateQFRRecord(String recordId) {
        if (String.isNotBlank(recordId)) {
            try {
                return [SELECT Id, Name FROM QFR_Submission__c WHERE Id = :recordId LIMIT 1];
            } catch (QueryException e) {
                // Record doesn't exist, create new one
            }
        }
        
        // Create new record
        QFR_Submission__c newRecord = new QFR_Submission__c();
        newRecord.Name = 'QFR-' + System.now().format('yyyyMMdd-HHmmss');
        newRecord.Status__c = 'Draft';
        newRecord.Created_Date__c = System.now();
        
        return newRecord;
    }
    
    private static void updateQFRFields(QFR_Submission__c qfrRecord, Map<String, Object> dataMap) {
        // Update simple fields
        if (dataMap.containsKey('contactName')) {
            qfrRecord.Contact_Name__c = (String) dataMap.get('contactName');
        }
        if (dataMap.containsKey('contactEmail')) {
            qfrRecord.Contact_Email__c = (String) dataMap.get('contactEmail');
        }
        if (dataMap.containsKey('contactPhone')) {
            qfrRecord.Contact_Phone__c = (String) dataMap.get('contactPhone');
        }
        if (dataMap.containsKey('contactPosition')) {
            qfrRecord.Contact_Position__c = (String) dataMap.get('contactPosition');
        }
        if (dataMap.containsKey('organizationName')) {
            qfrRecord.Organization_Name__c = (String) dataMap.get('organizationName');
        }
        if (dataMap.containsKey('napsId')) {
            qfrRecord.NAPS_ID__c = (String) dataMap.get('napsId');
        }
        if (dataMap.containsKey('solvencyConcern')) {
            qfrRecord.Solvency_Concern__c = (String) dataMap.get('solvencyConcern');
        }
        if (dataMap.containsKey('solvencyFuture')) {
            qfrRecord.Solvency_Future__c = (String) dataMap.get('solvencyFuture');
        }
        if (dataMap.containsKey('operationalLoss')) {
            qfrRecord.Operational_Loss__c = (String) dataMap.get('operationalLoss');
        }
        if (dataMap.containsKey('workforceEngagement')) {
            qfrRecord.Workforce_Engagement__c = (String) dataMap.get('workforceEngagement');
        }
        if (dataMap.containsKey('currentPage')) {
            qfrRecord.Current_Page__c = (Decimal) dataMap.get('currentPage');
        }
        
        // Store complex data as JSON
        qfrRecord.Form_Data__c = JSON.serialize(dataMap);
        qfrRecord.Last_Modified_Date__c = System.now();
    }
    
    private static ValidationResult validateSubmission(Map<String, Object> dataMap) {
        ValidationResult result = new ValidationResult();
        result.isValid = true;
        result.errors = new List<String>();
        
        // Validate required fields
        if (!dataMap.containsKey('solvencyConcern') || String.isBlank((String) dataMap.get('solvencyConcern'))) {
            result.errors.add('Solvency concern question is required');
        }
        
        if (!dataMap.containsKey('solvencyFuture') || String.isBlank((String) dataMap.get('solvencyFuture'))) {
            result.errors.add('Future solvency question is required');
        }
        
        if (!dataMap.containsKey('operationalLoss') || String.isBlank((String) dataMap.get('operationalLoss'))) {
            result.errors.add('Operational loss question is required');
        }
        
        if (!dataMap.containsKey('contactName') || String.isBlank((String) dataMap.get('contactName'))) {
            result.errors.add('Contact name is required');
        }
        
        if (!dataMap.containsKey('contactEmail') || String.isBlank((String) dataMap.get('contactEmail'))) {
            result.errors.add('Contact email is required');
        }
        
        // Validate email format
        String email = (String) dataMap.get('contactEmail');
        if (String.isNotBlank(email) && !Pattern.matches('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', email)) {
            result.errors.add('Invalid email format');
        }
        
        // Validate business structure
        if (dataMap.containsKey('businessStructureTypes')) {
            Object tempStructures = dataMap.get('businessStructureTypes');
            List<Object> structures = (List<Object>) tempStructures;
            Boolean hasSelectedStructure = false;
            
            for (Object structureObj : structures) {
                Map<String, Object> structure = (Map<String, Object>) structureObj;
                if ((Boolean) structure.get('selected')) {
                    hasSelectedStructure = true;
                    Object tempServiceTypes = structure.get('serviceTypes');
                    List<Object> serviceTypes = (List<Object>) tempServiceTypes;
                    if (serviceTypes == null || serviceTypes.isEmpty()) {
                        result.errors.add('Service types must be specified for selected business structures');
                    }
                }
            }
            
            if (!hasSelectedStructure) {
                result.errors.add('At least one business structure must be selected');
            }
        }
        
        if (!result.errors.isEmpty()) {
            result.isValid = false;
            result.errorMessage = String.join(result.errors, '; ');
        }
        
        return result;
    }
    
    private static String formatFileSize(Decimal sizeInBytes) {
        if (sizeInBytes == null) return '0 B';
        
        if (sizeInBytes < 1024) {
            return String.valueOf(sizeInBytes.intValue()) + ' B';
        } else if (sizeInBytes < 1024 * 1024) {
            return String.valueOf((sizeInBytes / 1024).setScale(1)) + ' KB';
        } else {
            return String.valueOf((sizeInBytes / (1024 * 1024)).setScale(1)) + ' MB';
        }
    }
    
    private static void sendSubmissionNotification(QFR_Submission__c qfrRecord) {
        try {
            // Implementation for sending notification email
            // This would typically use Salesforce's email services
            System.debug('Sending submission notification for QFR: ' + qfrRecord.Name);
        } catch (Exception e) {
            System.debug('Error sending notification: ' + e.getMessage());
        }
    }
    
    // Wrapper Classes
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
    
    private class ValidationResult {
        public Boolean isValid;
        public String errorMessage;
        public List<String> errors;
    }
}
