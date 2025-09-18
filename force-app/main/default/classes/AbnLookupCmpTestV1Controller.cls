public with sharing class AbnLookupCmpTestV1Controller {
    @AuraEnabled(cacheable=true)
    public static List<Account> findRecords(String searchTerm) {
        try {
            // Escape special characters in search term
            String searchKey = '%' + String.escapeSingleQuotes(searchTerm) + '%';
            
            // Query accounts matching the search term
            return [SELECT Id, Name 
                   FROM Account 
                   WHERE Name LIKE :searchKey 
                   ORDER BY Name 
                   LIMIT 5];
        } catch (Exception e) {
            throw new AuraHandledException('Error searching records: ' + e.getMessage());
        }
    }
}