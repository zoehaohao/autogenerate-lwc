public with sharing class testABNLookupv0Controller {
    @AuraEnabled
    public static ResponseWrapper lookupABN(String abnNumber) {
        try {
            // Validate ABN format
            if (String.isEmpty(abnNumber) || abnNumber.length() != 11) {
                return new ResponseWrapper(false, 'Invalid ABN format', null);
            }

            // In a real implementation, this would call the ABR Web Services
            // For now, returning mock data
            Map<String, String> mockData = new Map<String, String>{
                'entityName' => 'Test Company Pty Ltd',
                'abnStatus' => 'Active',
                'state' => 'NSW',
                'entityType' => 'Australian Private Company'
            };

            return new ResponseWrapper(true, 'Success', mockData);
        } catch (Exception e) {
            System.debug('ABN Lookup Error: ' + e.getMessage());
            return new ResponseWrapper(false, 'Error processing ABN lookup: ' + e.getMessage(), null);
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