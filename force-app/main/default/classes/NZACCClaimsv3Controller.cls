public with sharing class NZACCClaimsv3Controller {
    @AuraEnabled
    public static String saveClaim(Map<String, Object> claimData) {
        try {
            // Implement claim saving logic here
            // This is a placeholder for the actual implementation
            
            // Validate required fields
            if (!claimData.containsKey('claimNumber') || 
                !claimData.containsKey('claimantName') ||
                !claimData.containsKey('incidentDate')) {
                throw new AuraHandledException('Required fields are missing');
            }

            // Create new ACC Claim record
            ACC_Claim__c claim = new ACC_Claim__c(
                Claim_Number__c = (String)claimData.get('claimNumber'),
                Claimant_Name__c = (String)claimData.get('claimantName'),
                Incident_Date__c = Date.valueOf((String)claimData.get('incidentDate')),
                Claim_Type__c = (String)claimData.get('claimType'),
                Description__c = (String)claimData.get('description'),
                Status__c = (String)claimData.get('status')
            );

            // Insert with sharing rules
            insert claim;
            
            return claim.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving claim: ' + e.getMessage());
        }
    }
}