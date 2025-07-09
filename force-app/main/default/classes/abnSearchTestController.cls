public with sharing class abnSearchTestController {
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
            request.setEndpoint('https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn');
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout
            
            // Add search parameter
            String endpoint = request.getEndpoint() + '?search=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            request.setEndpoint(endpoint);

            // Make the callout
            HttpResponse response = http.send(request);

            // Process response
            if (response.getStatusCode() == 200) {
                List<Object> results = (List<Object>)JSON.deserializeUntyped(response.getBody());
                return new ResponseWrapper(true, 'Success', results);
            } else {
                return new ResponseWrapper(false, 'API Error: ' + response.getStatusCode(), null);
            }

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
