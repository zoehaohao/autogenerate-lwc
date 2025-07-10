public with sharing class abnLookupTestV2Controller {
    
    @AuraEnabled
    public static ResponseWrapper searchABN(String searchTerm) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term cannot be empty', null);
            }
            
            // Prepare HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn');
            request.setMethod('GET');
            request.setTimeout(30000); // 30 second timeout
            
            // Add query parameter
            request.setEndpoint(request.getEndpoint() + '?search=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            
            // Send request
            HttpResponse response = http.send(request);
            
            // Process response
            if (response.getStatusCode() == 200) {
                // Parse JSON response
                Object parsedData = JSON.deserializeUntyped(response.getBody());
                if (parsedData instanceof List<Object>) {
                    return new ResponseWrapper(true, 'Success', parsedData);
                } else {
                    return new ResponseWrapper(false, 'Invalid response format', null);
                }
            } else {
                return new ResponseWrapper(false, 'API call failed with status: ' + response.getStatusCode(), null);
            }
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
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
