public with sharing class abnLookupCmpTestV1Controller {
    @AuraEnabled(cacheable=true)
    public static List<SObject> search(String objectApiName, String searchTerm, String searchField, List<String> fields) {
        try {
            // Validate inputs
            if (String.isBlank(searchTerm) || String.isBlank(objectApiName) || 
                String.isBlank(searchField) || fields == null || fields.isEmpty()) {
                throw new AuraHandledException('Invalid search parameters');
            }
            
            // Sanitize inputs
            String sanitizedSearchTerm = String.escapeSingleQuotes(searchTerm);
            String sanitizedObjectName = String.escapeSingleQuotes(objectApiName);
            String sanitizedSearchField = String.escapeSingleQuotes(searchField);
            
            // Build field list for query
            Set<String> uniqueFields = new Set<String>{'Id'};
            uniqueFields.addAll(fields);
            
            // Build SOQL query
            String query = 'SELECT ' + String.join(new List<String>(uniqueFields), ', ') +
                         ' FROM ' + sanitizedObjectName +
                         ' WHERE ' + sanitizedSearchField + ' LIKE :searchPattern' +
                         ' LIMIT 10';
            
            String searchPattern = '%' + sanitizedSearchTerm + '%';
            
            // Execute query with sharing rules
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}