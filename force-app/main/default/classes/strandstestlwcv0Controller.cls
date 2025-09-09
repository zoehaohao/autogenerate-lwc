public with sharing class strandstestlwcv0Controller {
    @AuraEnabled
    public static String processText(String inputText) {
        try {
            if (String.isBlank(inputText)) {
                throw new AuraHandledException('Input text cannot be blank');
            }
            
            // Simple processing - reverse the input text
            return inputText.reverse();
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}