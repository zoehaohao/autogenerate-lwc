public with sharing class Strandstestlwcv0Controller {
    @AuraEnabled
    public static ResponseWrapper processData(String inputText) {
        try {
            if (String.isBlank(inputText)) {
                return new ResponseWrapper(false, 'Input text cannot be empty', null);
            }
            
            // Process the input text (example: convert to uppercase)
            String processedText = inputText.toUpperCase();
            
            return new ResponseWrapper(true, 'Successfully processed: ' + processedText, processedText);
        } catch (Exception e) {
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