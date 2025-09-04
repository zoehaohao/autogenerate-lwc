public with sharing class Strandstestlwcv0Controller {
    @AuraEnabled
    public static ResponseWrapper processData(String input) {
        try {
            // Add your business logic here
            String processedResult = 'Processed: ' + input;
            
            return new ResponseWrapper(true, 'Successfully processed data', processedResult);
        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
            return new ResponseWrapper(false, e.getMessage(), null);
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