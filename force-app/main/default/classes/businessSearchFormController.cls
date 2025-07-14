public with sharing class businessSearchFormController {
    @AuraEnabled
    public static ResponseWrapper searchBusiness(String searchTerm, String searchType) {
        try {
            // Validate input
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term cannot be empty', null);
            }

            // Prepare HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid');
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout

            // Add query parameters based on search type
            String endpoint = request.getEndpoint();
            endpoint += '?searchType=' + EncodingUtil.urlEncode(searchType, 'UTF-8');
            endpoint += '&searchTerm=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            request.setEndpoint(endpoint);

            // Make the callout
            HttpResponse response = http.send(request);

            // Process response
            if (response.getStatusCode() == 200) {
                Object parsedResponse = JSON.deserializeUntyped(response.getBody());
                return new ResponseWrapper(true, 'Success', parsedResponse);
            } else {
                return new ResponseWrapper(false, 'API Error: ' + response.getStatus(), null);
            }

        } catch (Exception e) {
            System.debug('Error in searchBusiness: ' + e.getMessage());
            return new ResponseWrapper(false, 'An error occurred: ' + e.getMessage(), null);
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
