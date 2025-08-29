public with sharing class StrandstestlwcV1Controller {
    @AuraEnabled
    public static ResponseWrapper lookupAbn(String abnNumber) {
        try {
            // Validate ABN format
            if (String.isEmpty(abnNumber) || abnNumber.length() != 11 || !abnNumber.isNumeric()) {
                return new ResponseWrapper(false, 'Invalid ABN format. Please enter a valid 11-digit ABN.', null);
            }

            // In a real implementation, this would call the ABN Lookup API
            // For demo purposes, returning mock data matching the UI mockup
            if (abnNumber == '45004189708') {
                Map<String, String> abnDetails = new Map<String, String>{
                    'abn' => '45 004 189 708',
                    'entityName' => 'ENTITY NAME: COLES SUPERMARKETS AUSTRALIA PTY LTD',
                    'entityType' => 'Australian Private Company',
                    'status' => 'Active from 14 Feb 2000',
                    'gst' => 'Registered from 01 Jul 2000',
                    'location' => 'VIC 3123'
                };
                return new ResponseWrapper(true, 'Success', abnDetails);
            }

            // If ABN not found
            return new ResponseWrapper(false, 'ABN not found', null);

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error in lookupAbn: ' + e.getMessage());
            return new ResponseWrapper(false, 'An error occurred while looking up the ABN: ' + e.getMessage(), null);
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