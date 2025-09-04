public with sharing class Strandstestlwcv0Controller {
    @AuraEnabled
    public static String processData(String input) {
        try {
            if (String.isBlank(input)) {
                throw new AuraHandledException('Input cannot be blank');
            }
            
            // Process the input (example implementation)
            String processedResult = 'Processed: ' + input;
            
            return processedResult;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}