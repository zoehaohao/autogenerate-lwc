public with sharing class strandstestlwcv1Controller {
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper lookupAbn(String abnNumber) {
        try {
            if (String.isBlank(abnNumber)) {
                return new ResponseWrapper(false, 'ABN number is required', null);
            }
            
            // Clean ABN number (remove spaces and special characters)
            String cleanAbn = abnNumber.replaceAll('[^0-9]', '');
            
            if (cleanAbn.length() != 11) {
                return new ResponseWrapper(false, 'ABN must be 11 digits', null);
            }
            
            // Mock data based on the example provided
            Map<String, Object> businessData = new Map<String, Object>();
            
            if (cleanAbn == '45004189708') {
                businessData.put('abn', '45 004 189 708');
                businessData.put('entityName', 'COLES SUPERMARKETS AUSTRALIA PTY LTD');
                businessData.put('abnStatus', 'Active from 14 Feb 2000');
                businessData.put('entityType', 'Australian Private Company');
                businessData.put('gstStatus', 'Registered from 01 Jul 2000');
                businessData.put('activeSince', '14 Feb 2000');
                businessData.put('mainBusinessLocation', 'VIC 3123');
            } else {
                // For demo purposes, return mock data for any other ABN
                businessData.put('abn', formatAbn(cleanAbn));
                businessData.put('entityName', 'SAMPLE BUSINESS PTY LTD');
                businessData.put('abnStatus', 'Active from 01 Jan 2020');
                businessData.put('entityType', 'Australian Private Company');
                businessData.put('gstStatus', 'Registered from 01 Jan 2020');
                businessData.put('activeSince', '01 Jan 2020');
                businessData.put('mainBusinessLocation', 'NSW 2000');
            }
            
            return new ResponseWrapper(true, 'ABN lookup successful', businessData);
            
        } catch (Exception e) {
            System.debug('Error in lookupAbn: ' + e.getMessage());
            return new ResponseWrapper(false, 'An error occurred: ' + e.getMessage(), null);
        }
    }
    
    private static String formatAbn(String cleanAbn) {
        if (cleanAbn.length() == 11) {
            return cleanAbn.substring(0, 2) + ' ' + 
                   cleanAbn.substring(2, 5) + ' ' + 
                   cleanAbn.substring(5, 8) + ' ' + 
                   cleanAbn.substring(8, 11);
        }
        return cleanAbn;
    }
    
    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Object data;
        @AuraEnabled public List<String> errors;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = new List<String>();
        }
    }
}