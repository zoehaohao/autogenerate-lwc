public with sharing class strandstestlwcv1Controller {
    @AuraEnabled
    public static String processData(String input) {
        try {
            // Simple processing - in real application, add actual business logic
            return 'Processed: ' + input;
        } catch (Exception e) {
            throw new AuraHandledException('Error processing data: ' + e.getMessage());
        }
    }
}