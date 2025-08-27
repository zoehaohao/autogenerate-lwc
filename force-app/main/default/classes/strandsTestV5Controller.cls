public with sharing class strandsTestV5Controller {
    @AuraEnabled
    public static ResponseWrapper lookupABN(String abnNumber) {
        try {
            // Validate ABN format
            if (!Pattern.matches('^\\d{11}$', abnNumber)) {
                return new ResponseWrapper(false, 'Invalid ABN format', null);
            }

            // In a real implementation, this would call the ABR Web Services
            // For demo purposes, returning mock data matching the screenshot
            if (abnNumber == '45004189708') {
                Map<String, String> abnData = new Map<String, String>{
                    'abn' => '45 004 189 708',
                    'entityName' => 'Entity Name: COLES SUPERMARKETS AUSTRALIA PTY LTD',
                    'status' => 'Active from 14 Feb 2000',
                    'entityType' => 'Australian Private Company',
                    'gstStatus' => 'Registered from 01 Jul 2000',
                    'location' => 'VIC 3123'
                };
                return new ResponseWrapper(true, 'Success', abnData);
            }

            return new ResponseWrapper(false, 'ABN not found', null);
        } catch (Exception e) {
            return new ResponseWrapper(false, e.getMessage(), null);
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