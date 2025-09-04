public with sharing class strandstestlwcv0Controller {
    @AuraEnabled
    public static ResponseWrapper processData(String inputData) {
        try {
            if (String.isBlank(inputData)) {
                return new ResponseWrapper(false, 'Input data cannot be blank', null);
            }

            // Process the input data (example implementation)
            String processedData = 'Processed: ' + inputData.toUpperCase();
            
            return new ResponseWrapper(true, 'Success', processedData);
        } catch (Exception e) {
            System.debug('Error processing data: ' + e.getMessage());
            return new ResponseWrapper(false, 'Error processing data: ' + e.getMessage(), null);
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