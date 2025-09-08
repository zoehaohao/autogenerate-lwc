public with sharing class StrandstestlwcV0Controller {
    @AuraEnabled
    public static String processData(String input) {
        try {
            if (String.isBlank(input)) {
                throw new AuraHandledException('Input cannot be blank');
            }
            
            // Process the input - for demo just reverse it
            return input.reverse();
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}