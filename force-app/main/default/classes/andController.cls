public with sharing class andController {
    @AuraEnabled
    public static ResponseWrapper saveContact(String firstName, String lastName) {
        try {
            // Input validation
            if (String.isBlank(firstName) || String.isBlank(lastName)) {
                return new ResponseWrapper(false, 'First Name and Last Name are required', null);
            }

            // Create new Contact
            Contact newContact = new Contact(
                FirstName = firstName.trim(),
                LastName = lastName.trim()
            );

            // Insert with sharing rules respected
            insert newContact;

            return new ResponseWrapper(true, 'Contact created successfully', newContact);
        } catch (Exception e) {
            System.debug('Error saving contact: ' + e.getMessage());
            return new ResponseWrapper(false, 'Error saving contact: ' + e.getMessage(), null);
        }
    }
    
    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Object data;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
    }
}
