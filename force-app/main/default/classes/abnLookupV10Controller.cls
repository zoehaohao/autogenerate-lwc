public with sharing class abnLookupV10Controller {
    @AuraEnabled(cacheable=true)
    public static List<SObject> search(
        String objectApiName,
        String searchTerm,
        List<String> fields,
        List<String> searchFields,
        String subtitleField,
        String whereClause,
        Integer limitSize
    ) {
        try {
            // Validate inputs
            if (String.isBlank(objectApiName) || String.isBlank(searchTerm) || 
                fields == null || fields.isEmpty() || 
                searchFields == null || searchFields.isEmpty()) {
                throw new AuraHandledException('Invalid search parameters');
            }

            // Sanitize inputs
            searchTerm = String.escapeSingleQuotes(searchTerm);
            String sanitizedWhereClause = String.isNotBlank(whereClause) ? 
                String.escapeSingleQuotes(whereClause) : '';

            // Build field list
            Set<String> uniqueFields = new Set<String>();
            uniqueFields.addAll(fields);
            if (String.isNotBlank(subtitleField)) {
                uniqueFields.add(subtitleField);
            }
            
            // Build SOSL search fields
            List<String> searchFieldsList = new List<String>();
            for (String field : searchFields) {
                searchFieldsList.add(field + ' LIKE \'%' + searchTerm + '%\'');
            }

            // Build query
            String query = 'SELECT Id, ' + String.join(new List<String>(uniqueFields), ', ') +
                         ' FROM ' + objectApiName +
                         ' WHERE (' + String.join(searchFieldsList, ' OR ') + ')';
            
            // Add where clause if provided
            if (String.isNotBlank(sanitizedWhereClause)) {
                query += ' AND (' + sanitizedWhereClause + ')';
            }

            // Add limit
            query += ' LIMIT ' + Math.min(limitSize, 100);

            // Execute query with sharing rules
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}