public with sharing class StrandstestlwcV0Controller {
    @AuraEnabled
    public static String processData(String input) {
        try {
            // Basic input validation
            if (String.isBlank(input)) {
                throw new AuraHandledException('Input cannot be empty');
            }
            
            // Process the input (example implementation)
            String processedResult = 'Processed: ' + input;
            
            return processedResult;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}