public with sharing class StrandstestlwcV0Controller {
    @AuraEnabled
    public static String processData(String inputText) {
        try {
            if (String.isBlank(inputText)) {
                throw new AuraHandledException('Input text cannot be blank');
            }
            
            // Process the input text - for now just return uppercase version
            return inputText.toUpperCase();
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}