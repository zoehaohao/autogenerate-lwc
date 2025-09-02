public with sharing class strandstestlwcv0Controller {
    @AuraEnabled
    public static ResponseWrapper processData(String inputText) {
        try {
            if (String.isBlank(inputText)) {
                return new ResponseWrapper(false, 'Input text cannot be empty', null);
            }

            // Process the input text (example processing)
            String processedText = 'Processed: ' + inputText.toUpperCase();
            
            return new ResponseWrapper(true, 'Success', processedText);
        } catch (Exception e) {
            System.debug('Error in processData: ' + e.getMessage());
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