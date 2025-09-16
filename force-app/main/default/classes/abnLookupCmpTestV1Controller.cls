public with sharing class abnLookupCmpTestV1Controller {
    @AuraEnabled(cacheable=true)
    public static List<SObject> search(String searchTerm, String objectName) {
        try {
            // Validate inputs
            if (String.isBlank(searchTerm) || String.isBlank(objectName)) {
                return new List<SObject>();
            }

            // Sanitize the input to prevent SOQL injection
            String sanitizedSearchTerm = String.escapeSingleQuotes(searchTerm);
            String sanitizedObjectName = String.escapeSingleQuotes(objectName);
            
            // Build the SOQL query
            String query = 'SELECT Id, Name FROM ' + sanitizedObjectName + 
                         ' WHERE Name LIKE \'%' + sanitizedSearchTerm + '%\' ' +
                         ' LIMIT 5';
            
            // Execute the query
            List<SObject> results = Database.query(query);
            return results;
            
        } catch (Exception e) {
            System.debug('Error in search method: ' + e.getMessage());
            throw new AuraHandledException('Error performing search: ' + e.getMessage());
        }
    }
}