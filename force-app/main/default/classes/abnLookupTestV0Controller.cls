public with sharing class abnLookupTestV0Controller {
    @AuraEnabled(cacheable=true)
    public static List<SObject> searchRecords(String objectApiName, String searchTerm, List<String> searchFields, String titleField, String subtitleField) {
        try {
            // Validate inputs
            if (String.isBlank(objectApiName) || String.isBlank(searchTerm) || searchFields == null || searchFields.isEmpty()) {
                throw new AuraHandledException('Invalid search parameters');
            }

            // Build SOSL query
            String searchQuery = 'FIND :searchTerm IN ALL FIELDS RETURNING ' + objectApiName + '(Id';
            
            // Add fields to return
            Set<String> uniqueFields = new Set<String>();
            uniqueFields.add(titleField);
            uniqueFields.add(subtitleField);
            uniqueFields.addAll(searchFields);
            
            for (String field : uniqueFields) {
                searchQuery += ', ' + field;
            }
            
            searchQuery += ' ORDER BY ' + titleField + ' LIMIT 10)';

            // Execute search
            List<List<SObject>> searchResults = Search.query(searchQuery);
            
            // Return first list of results (we're only searching one object)
            return searchResults.isEmpty() ? new List<SObject>() : searchResults[0];
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}