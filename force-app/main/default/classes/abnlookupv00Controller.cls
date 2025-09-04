public with sharing class abnlookupv00Controller {
    @AuraEnabled
    public static ResponseWrapper searchABN(String abnNumber) {
        try {
            // Validate ABN format
            if (String.isEmpty(abnNumber) || abnNumber.length() != 11 || !abnNumber.isNumeric()) {
                return new ResponseWrapper(false, 'Invalid ABN format. Please enter 11 digits.', null);
            }

            // In a real implementation, this would call the ABN Lookup API
            // For demonstration, returning mock data
            Map<String, String> mockAbnDetails = new Map<String, String>{
                'entityName' => 'DEMO COMPANY PTY LTD',
                'abnStatus' => 'Active',
                'entityType' => 'Australian Private Company',
                'state' => 'NSW'
            };

            return new ResponseWrapper(true, 'Success', mockAbnDetails);
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error in searchABN: ' + e.getMessage());
            return new ResponseWrapper(false, 'An error occurred while processing your request: ' + e.getMessage(), null);
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