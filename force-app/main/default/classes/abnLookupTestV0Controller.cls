public with sharing class abnLookupTestV0Controller {
    @AuraEnabled(cacheable=true)
    public static List<ResultWrapper> search(String searchTerm, String objectApiName, String fieldApiName) {
        try {
            if (String.isBlank(searchTerm) || String.isBlank(objectApiName) || String.isBlank(fieldApiName)) {
                return new List<ResultWrapper>();
            }

            String searchQuery = 'SELECT Id, ' + String.escapeSingleQuotes(fieldApiName) + 
                               ' FROM ' + String.escapeSingleQuotes(objectApiName) + 
                               ' WHERE ' + String.escapeSingleQuotes(fieldApiName) + ' LIKE \'%' + String.escapeSingleQuotes(searchTerm) + '%\' ' +
                               'LIMIT 10';

            List<ResultWrapper> results = new List<ResultWrapper>();
            for (SObject record : Database.query(searchQuery)) {
                results.add(new ResultWrapper(
                    (String)record.get('Id'),
                    (String)record.get(fieldApiName)
                ));
            }
            return results;
        } catch (Exception e) {
            System.debug('Error in search: ' + e.getMessage());
            throw new AuraHandledException('Error performing search: ' + e.getMessage());
        }
    }

    public class ResultWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String name;

        public ResultWrapper(String id, String name) {
            this.id = id;
            this.name = name;
        }
    }
}