public with sharing class ContactSearchTestController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> searchContactsByName(String searchTerm, Integer limitResults) {
        try {
            if (String.isBlank(searchTerm) || searchTerm.length() < 2) {
                throw new AuraHandledException('Search term must be at least 2 characters');
            }

            String searchPattern = '%' + String.escapeSingleQuotes(searchTerm) + '%';
            
            return [
                SELECT Id, FirstName, LastName, Name, Email, Phone, Account.Name, Title 
                FROM Contact 
                WHERE (FirstName LIKE :searchPattern 
                    OR LastName LIKE :searchPattern 
                    OR Name LIKE :searchPattern)
                AND IsDeleted = false
                WITH SECURITY_ENFORCED
                ORDER BY LastName, FirstName
                LIMIT :limitResults
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
