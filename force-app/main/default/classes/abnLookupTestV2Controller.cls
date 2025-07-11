public with sharing class abnLookupTestV2Controller {
    @AuraEnabled
    public static ResponseWrapper searchABN(String searchTerm) {
        try {
            // Validate input
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term cannot be empty', null);
            }

            // Initialize HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid');
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout

            // Add query parameter based on search type
            String endpoint = request.getEndpoint();
            endpoint += '?searchTerm=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            request.setEndpoint(endpoint);

            // Make the callout
            HttpResponse response = http.send(request);

            // Process response
            if (response.getStatusCode() == 200) {
                Object results = JSON.deserializeUntyped(response.getBody());
                return new ResponseWrapper(true, 'Success', results);
            } else {
                return new ResponseWrapper(false, 'API Error: ' + response.getStatusCode() + ' ' + response.getStatus(), null);
            }

        } catch (Exception e) {
            return new ResponseWrapper(false, 'Error: ' + e.getMessage(), null);
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
