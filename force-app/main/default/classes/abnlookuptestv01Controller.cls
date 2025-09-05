public with sharing class abnlookuptestv01Controller {
    @AuraEnabled(cacheable=true)
    public static List<SObject> search(String objectApiName, List<String> fields, String searchTerm, String whereClause) {
        try {
            // Validate inputs
            if (String.isBlank(objectApiName) || fields == null || fields.isEmpty() || String.isBlank(searchTerm)) {
                throw new AuraHandledException('Invalid search parameters');
            }

            // Sanitize inputs to prevent SOQL injection
            String sanitizedSearchTerm = String.escapeSingleQuotes(searchTerm);
            String sanitizedWhereClause = String.isNotBlank(whereClause) ? String.escapeSingleQuotes(whereClause) : '';
            
            // Build the SOQL query
            String soqlQuery = 'SELECT Id, ' + String.join(fields, ', ') + 
                             ' FROM ' + objectApiName + 
                             ' WHERE ' + fields[0] + ' LIKE \'%' + sanitizedSearchTerm + '%\'';
            
            if (String.isNotBlank(sanitizedWhereClause)) {
                soqlQuery += ' AND ' + sanitizedWhereClause;
            }
            
            soqlQuery += ' ORDER BY ' + fields[0] + ' LIMIT 10';

            // Execute query with sharing rules enforced
            List<SObject> results = Database.query(soqlQuery);
            return results;

        } catch (Exception e) {
            throw new AuraHandledException('Error performing search: ' + e.getMessage());
        }
    }
}