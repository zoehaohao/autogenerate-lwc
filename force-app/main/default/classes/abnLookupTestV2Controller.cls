public with sharing class abnLookupTestV2Controller {
    @AuraEnabled
    public static ResponseWrapper searchABN(String searchTerm) {
        try {
            // Validate input
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term cannot be empty', null);
            }

            // Prepare HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid');
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout

            // Add search parameter based on input format
            String searchType = determineSearchType(searchTerm);
            request.setEndpoint(request.getEndpoint() + '?' + searchType + '=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));

            // Make the callout
            HttpResponse response = http.send(request);

            // Process response
            if (response.getStatusCode() == 200) {
                Object results = JSON.deserializeUntyped(response.getBody());
                return new ResponseWrapper(true, 'Success', results);
            } else {
                return new ResponseWrapper(false, 'API Error: ' + response.getStatus(), null);
            }

        } catch (Exception e) {
            return new ResponseWrapper(false, 'Error: ' + e.getMessage(), null);
        }
    }

    private static String determineSearchType(String searchTerm) {
        // Remove any spaces or special characters
        String cleanTerm = searchTerm.replaceAll('[^a-zA-Z0-9]', '');
        
        if (cleanTerm.length() == 11 && cleanTerm.isNumeric()) {
            return 'abn';
        } else if (cleanTerm.length() == 9 && cleanTerm.isNumeric()) {
            return 'acn';
        } else {
            return 'name';
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
