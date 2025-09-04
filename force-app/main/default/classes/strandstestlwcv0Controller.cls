public with sharing class strandstestlwcv0Controller {
    @AuraEnabled
    public static ResponseWrapper processData(String inputString) {
        try {
            if (String.isBlank(inputString)) {
                throw new AuraHandledException('Input string cannot be empty');
            }

            // Process the input string (example processing)
            String processedResult = 'Processed: ' + inputString.toUpperCase();

            return new ResponseWrapper(true, processedResult, null);
        } catch (Exception e) {
            System.debug('Error in processData: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
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