public with sharing class testRegenerationV0Controller {
    @AuraEnabled
    public static String processData(String input) {
        try {
            if (String.isBlank(input)) {
                throw new AuraHandledException('Input cannot be blank');
            }
            
            // Process the input (simple echo for demonstration)
            return 'Processed: ' + input;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}