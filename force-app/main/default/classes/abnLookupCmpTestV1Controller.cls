public with sharing class abnLookupCmpTestV1Controller {
    @AuraEnabled(cacheable=true)
    public static List<SearchResult> search(String searchTerm, String objectName) {
        try {
            if (String.isBlank(searchTerm) || String.isBlank(objectName)) {
                return new List<SearchResult>();
            }

            String searchQuery = 'FIND :searchTerm IN ALL FIELDS RETURNING ' + 
                String.escapeSingleQuotes(objectName) + '(Id, Name) LIMIT 10';
            
            List<List<SObject>> searchResults = Search.query(searchQuery);
            
            List<SearchResult> results = new List<SearchResult>();
            if (!searchResults.isEmpty() && !searchResults[0].isEmpty()) {
                for (SObject record : searchResults[0]) {
                    results.add(new SearchResult(
                        (String)record.get('Id'),
                        (String)record.get('Name')
                    ));
                }
            }
            
            return results;
        } catch (Exception e) {
            throw new AuraHandledException('Error searching records: ' + e.getMessage());
        }
    }
    
    public class SearchResult {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        
        public SearchResult(String id, String name) {
            this.id = id;
            this.name = name;
        }
    }
}