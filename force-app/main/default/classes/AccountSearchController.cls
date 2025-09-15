public with sharing class AccountSearchController {
    @AuraEnabled(cacheable=true)
    public static List<Account> searchAccounts(String searchTerm) {
        String searchKey = '%' + searchTerm + '%';
        
        try {
            return [
                SELECT Id, Name
                FROM Account
                WHERE Name LIKE :searchKey
                ORDER BY Name
                LIMIT 10
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error searching accounts: ' + e.getMessage());
        }
    }
}