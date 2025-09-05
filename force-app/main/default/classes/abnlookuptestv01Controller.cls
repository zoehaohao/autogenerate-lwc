public with sharing class abnlookuptestv01Controller {
    @AuraEnabled(cacheable=true)
    public static List<SObject> search(String searchTerm, String objectApiName, String searchField) {
        try {
            // Validate inputs
            if (String.isBlank(searchTerm) || String.isBlank(objectApiName) || String.isBlank(searchField)) {
                throw new AuraHandledException('Required parameters are missing');
            }
            
            // Sanitize inputs to prevent SOQL injection
            String sanitizedSearchTerm = String.escapeSingleQuotes(searchTerm);
            String sanitizedObjectName = String.escapeSingleQuotes(objectApiName);
            String sanitizedSearchField = String.escapeSingleQuotes(searchField);
            
            // Build and execute query
            String query = 'SELECT Id, ' + sanitizedSearchField + 
                         ' FROM ' + sanitizedObjectName + 
                         ' WHERE ' + sanitizedSearchField + ' LIKE \'%' + sanitizedSearchTerm + '%\'' +
                         ' LIMIT 10';
            
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}