public with sharing class NZACCClaimsController {
    @AuraEnabled(cacheable=true)
    public static List<ACC_Claim__c> getClaims() {
        try {
            return [
                SELECT Id, Claim_Number__c, Claimant_Name__c, 
                       Injury_Type__c, Incident_Date__c, Status__c
                FROM ACC_Claim__c
                ORDER BY CreatedDate DESC
                LIMIT 1000
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving claims: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static List<ACC_Claim__c> searchClaims(String searchTerm, String status) {
        try {
            String query = 'SELECT Id, Claim_Number__c, Claimant_Name__c, ' +
                         'Injury_Type__c, Incident_Date__c, Status__c ' +
                         'FROM ACC_Claim__c WHERE ';
            
            List<String> conditions = new List<String>();
            List<String> searchTerms = new List<String>();
            
            if (String.isNotBlank(searchTerm)) {
                searchTerms.add('%' + String.escapeSingleQuotes(searchTerm) + '%');
                conditions.add('(Claim_Number__c LIKE :searchTerms[0] OR ' +
                             'Claimant_Name__c LIKE :searchTerms[0] OR ' +
                             'Injury_Type__c LIKE :searchTerms[0])');
            }
            
            if (String.isNotBlank(status) && status != 'All') {
                conditions.add('Status__c = :status');
            }
            
            if (!conditions.isEmpty()) {
                query += String.join(conditions, ' AND ');
            } else {
                query = query.removeEnd(' WHERE ');
            }
            
            query += ' ORDER BY CreatedDate DESC LIMIT 1000';
            
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException('Error searching claims: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteClaim(Id claimId) {
        try {
            ACC_Claim__c claim = [SELECT Id FROM ACC_Claim__c WHERE Id = :claimId];
            delete claim;
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting claim: ' + e.getMessage());
        }
    }
}