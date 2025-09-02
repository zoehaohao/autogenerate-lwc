public with sharing class abnLookupV11Controller {
    @AuraEnabled(cacheable=true)
    public static List<LookupResult> search(String objectApiName, String fieldApiName, String searchTerm, String filters) {
        try {
            // Validate inputs
            if (String.isBlank(objectApiName) || String.isBlank(fieldApiName) || String.isBlank(searchTerm)) {
                throw new AuraHandledException('Required parameters are missing');
            }

            // Build the SOQL query
            String searchPattern = '%' + String.escapeSingleQuotes(searchTerm) + '%';
            String queryTemplate = 'SELECT Id, {0} FROM {1} WHERE {0} LIKE :searchPattern';
            
            // Add filters if provided
            if (String.isNotBlank(filters)) {
                queryTemplate += ' AND ' + filters;
            }
            
            queryTemplate += ' ORDER BY {0} ASC LIMIT 10';
            
            // Format and execute the query
            String formattedQuery = String.format(
                queryTemplate,
                new List<String>{
                    String.escapeSingleQuotes(fieldApiName),
                    String.escapeSingleQuotes(objectApiName)
                }
            );
            
            List<SObject> queryResults = Database.query(formattedQuery);
            
            // Convert results to LookupResult format
            List<LookupResult> results = new List<LookupResult>();
            for (SObject record : queryResults) {
                results.add(new LookupResult(
                    (String)record.get('Id'),
                    (String)record.get(fieldApiName)
                ));
            }
            
            return results;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    public class LookupResult {
        @AuraEnabled public String value;
        @AuraEnabled public String label;
        
        public LookupResult(String value, String label) {
            this.value = value;
            this.label = label;
        }
    }
}