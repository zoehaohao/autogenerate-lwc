public with sharing class strandstestlwcv0Controller {
    @AuraEnabled(cacheable=false)
    public static String processData(String formData) {
        try {
            if (String.isBlank(formData)) {
                throw new AuraHandledException('Input data cannot be empty');
            }
            
            // Simple processing - reverse the string and make it uppercase
            String processedData = formData.reverse().toUpperCase();
            
            return processedData;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}