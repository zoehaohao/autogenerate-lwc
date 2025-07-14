public with sharing class ContactSearchTestController {
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchContactsByName(String searchTerm, Integer limitResults) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            if (searchTerm.length() < 2) {
                return new ResponseWrapper(false, 'Search term must be at least 2 characters', null);
            }
            
            // Sanitize input to prevent SOQL injection
            String sanitizedSearchTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Set default limit if not provided
            Integer queryLimit = (limitResults != null && limitResults > 0) ? limitResults : 50;
            
            // Ensure limit doesn't exceed maximum
            if (queryLimit > 200) {
                queryLimit = 200;
            }
            
            // Build dynamic SOQL query
            String soqlQuery = buildContactQuery(sanitizedSearchTerm, queryLimit);
            
            // Execute query with security enforcement
            List<Contact> contacts = Database.query(soqlQuery);
            
            // Process results
            List<ContactWrapper> processedContacts = processContactResults(contacts);
            
            return new ResponseWrapper(true, 'Search completed successfully', processedContacts);
            
        } catch (QueryException qe) {
            System.debug('Query Exception: ' + qe.getMessage());
            return new ResponseWrapper(false, 'Unable to search contacts. Please check your permissions.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred while searching contacts', null);
        }
    }
    
    private static String buildContactQuery(String searchTerm, Integer queryLimit) {
        String searchPattern = '%' + searchTerm + '%';
        
        String query = 'SELECT Id, FirstName, LastName, Name, Email, Phone, Account.Name, Title ' +
                      'FROM Contact ' +
                      'WHERE (FirstName LIKE :searchPattern OR LastName LIKE :searchPattern OR Name LIKE :searchPattern) ' +
                      'AND IsDeleted = false ' +
                      'WITH SECURITY_ENFORCED ' +
                      'ORDER BY LastName, FirstName ' +
                      'LIMIT :queryLimit';
        
        return query;
    }
    
    private static List<ContactWrapper> processContactResults(List<Contact> contacts) {
        List<ContactWrapper> processedContacts = new List<ContactWrapper>();
        
        for (Contact contact : contacts) {
            ContactWrapper wrapper = new ContactWrapper();
            wrapper.Id = contact.Id;
            wrapper.FirstName = contact.FirstName;
            wrapper.LastName = contact.LastName;
            wrapper.Name = contact.Name;
            wrapper.Email = contact.Email;
            wrapper.Phone = contact.Phone;
            wrapper.Title = contact.Title;
            
            // Handle Account relationship safely
            if (contact.Account != null) {
                wrapper.Account = new AccountWrapper();
                wrapper.Account.Name = contact.Account.Name;
            }
            
            processedContacts.add(wrapper);
        }
        
        return processedContacts;
    }
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper validateSearchAccess() {
        try {
            // Check if user has access to Contact object
            if (!Schema.sObjectType.Contact.isAccessible()) {
                return new ResponseWrapper(false, 'You do not have permission to access contacts', null);
            }
            
            // Check field-level security
            Map<String, Schema.SObjectField> contactFields = Schema.sObjectType.Contact.fields.getMap();
            List<String> requiredFields = new List<String>{'Name', 'Email', 'Phone', 'Title'};
            
            for (String fieldName : requiredFields) {
                if (contactFields.containsKey(fieldName)) {
                    Schema.SObjectField field = contactFields.get(fieldName);
                    if (!field.getDescribe().isAccessible()) {
                        return new ResponseWrapper(false, 'Insufficient field permissions for contact search', null);
                    }
                }
            }
            
            return new ResponseWrapper(true, 'Access validation successful', null);
            
        } catch (Exception e) {
            System.debug('Access validation error: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to validate access permissions', null);
        }
    }
    
    // Wrapper classes for clean data transfer
    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Object data;
        @AuraEnabled public List<String> errors;
        @AuraEnabled public Integer recordCount;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = new List<String>();
            
            if (data instanceof List<Object>) {
                this.recordCount = ((List<Object>) data).size();
            } else {
                this.recordCount = data != null ? 1 : 0;
            }
        }
    }
    
    public class ContactWrapper {
        @AuraEnabled public String Id;
        @AuraEnabled public String FirstName;
        @AuraEnabled public String LastName;
        @AuraEnabled public String Name;
        @AuraEnabled public String Email;
        @AuraEnabled public String Phone;
        @AuraEnabled public String Title;
        @AuraEnabled public AccountWrapper Account;
    }
    
    public class AccountWrapper {
        @AuraEnabled public String Name;
    }
}
