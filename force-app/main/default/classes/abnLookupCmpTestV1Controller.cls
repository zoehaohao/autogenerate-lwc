public with sharing class AbnLookupCmpTestV1Controller {
    @AuraEnabled(cacheable=true)
    public static List<SObject> search(String objectApiName, String searchTerm, List<String> searchFields, String subtitleField) {
        try {
            // Input validation
            if (String.isBlank(objectApiName) || String.isBlank(searchTerm) || searchFields == null || searchFields.isEmpty()) {
                throw new AuraHandledException('Invalid input parameters');
            }

            // Build field list for query
            Set<String> fieldsToQuery = new Set<String>{'Id'};
            fieldsToQuery.addAll(searchFields);
            if (String.isNotBlank(subtitleField)) {
                fieldsToQuery.add(subtitleField);
            }

            // Build search conditions
            List<String> searchConditions = new List<String>();
            for (String field : searchFields) {
                searchConditions.add(field + ' LIKE \'%' + String.escapeSingleQuotes(searchTerm) + '%\'');
            }

            // Build and execute query
            String query = 'SELECT ' + String.join(new List<String>(fieldsToQuery), ',') +
                         ' FROM ' + String.escapeSingleQuotes(objectApiName) +
                         ' WHERE ' + String.join(searchConditions, ' OR ') +
                         ' LIMIT 10';

            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}