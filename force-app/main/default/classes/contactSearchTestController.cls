public with sharing class ContactSearchController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> searchContactsByName(String searchTerm, Integer limitResults) {
        try {
            if (String.isBlank(searchTerm) || searchTerm.length() < 2) {
                return new List<Contact>();
            }

            String searchKey = '%' + String.escapeSingleQuotes(searchTerm) + '%';
            
            return [
                SELECT Id, FirstName, LastName, Name, Email, Phone, Account.Name, Title 
                FROM Contact 
                WHERE (FirstName LIKE :searchKey OR LastName LIKE :searchKey OR Name LIKE :searchKey)
                AND IsDeleted = false
                WITH SECURITY_ENFORCED
                ORDER BY LastName, FirstName
                LIMIT :limitResults
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error searching contacts: ' + e.getMessage());
        }
    }
}
