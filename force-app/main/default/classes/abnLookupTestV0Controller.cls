public with sharing class abnLookupTestV0Controller {
    @AuraEnabled(cacheable=true)
    public static List<SObject> search(String objectApiName, String searchTerm, String searchField) {
        try {
            // Validate inputs
            if (String.isBlank(objectApiName) || String.isBlank(searchTerm) || String.isBlank(searchField)) {
                throw new AuraHandledException('Required parameters are missing');
            }
            
            // Build dynamic SOQL
            String searchKey = '%' + String.escapeSingleQuotes(searchTerm) + '%';
            String queryString = 'SELECT Id, ' + String.escapeSingleQuotes(searchField) +
                               ' FROM ' + String.escapeSingleQuotes(objectApiName) +
                               ' WHERE ' + String.escapeSingleQuotes(searchField) + ' LIKE :searchKey' +
                               ' LIMIT 10';
            
            // Execute query
            List<SObject> results = Database.query(queryString);
            return results;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}