public with sharing class testRegenerationV0Controller {
    @AuraEnabled(cacheable=true)
    public static List<SearchResult> search(String searchTerm) {
        List<SearchResult> results = new List<SearchResult>();
        try {
            // Perform search logic here
            return results;
        } catch (Exception e) {
            throw new AuraHandledException('Error performing search: ' + e.getMessage());
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