public with sharing class abnLookupTestV0Controller {
    @AuraEnabled(cacheable=true)
    public static List<SObject> search(String objectApiName, String searchTerm, List<String> searchFields) {
        try {
            // Validate inputs
            if (String.isBlank(objectApiName) || String.isBlank(searchTerm) || searchFields == null || searchFields.isEmpty()) {
                throw new AuraHandledException('Invalid search parameters');
            }

            // Build the SOSL query
            String searchQuery = 'FIND :searchTerm IN ALL FIELDS RETURNING ' + 
                               String.escapeSingleQuotes(objectApiName) + 
                               '(Id, Name, Type WHERE Name LIKE :likeSearchTerm) LIMIT 10';
            
            String likeSearchTerm = '%' + String.escapeSingleQuotes(searchTerm) + '%';
            
            // Perform the search
            List<List<SObject>> searchResults = Search.query(searchQuery);
            
            if (!searchResults.isEmpty() && !searchResults[0].isEmpty()) {
                return searchResults[0];
            }
            
            return new List<SObject>();
        } catch (Exception e) {
            throw new AuraHandledException('Error performing search: ' + e.getMessage());
        }
    }
}