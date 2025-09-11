public with sharing class personalFormApprovetest1Controller {
    @AuraEnabled
    public static ResponseWrapper submitForApproval(String formData) {
        try {
            // Deserialize the form data
            Map<String, Object> formMap = (Map<String, Object>) JSON.deserializeUntyped(formData);
            
            // Validate required fields
            if (!formMap.containsKey('name') || !formMap.containsKey('email')) {
                return new ResponseWrapper(false, 'Name and Email are required fields', null);
            }
            
            // Create approval process record here
            // This is a placeholder - implement your actual approval process logic
            
            return new ResponseWrapper(true, 'Form submitted for approval successfully', null);
        } catch (Exception e) {
            System.debug('Error in submitForApproval: ' + e.getMessage());
            return new ResponseWrapper(false, 'Error processing request: ' + e.getMessage(), null);
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