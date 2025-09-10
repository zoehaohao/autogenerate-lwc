public with sharing class testRegenerationV0Controller {
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper processData(String formData) {
        try {
            if (String.isBlank(formData)) {
                return new ResponseWrapper(false, 'Input data cannot be empty', null);
            }
            
            // Process the input data
            String processedResult = 'Processed: ' + formData;
            
            return new ResponseWrapper(true, 'Data processed successfully', processedResult);
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error processing data: ' + e.getMessage());
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