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
            request.setEndpoint('https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn');
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout
            
            // Send request
            HttpResponse response = http.send(request);
            
            // Process response
            if (response.getStatusCode() == 200) {
                // Parse JSON response
                List<Object> results = (List<Object>) JSON.deserializeUntyped(response.getBody());
                List<Map<String, Object>> formattedResults = new List<Map<String, Object>>();
                
                // Format results
                for (Object obj : results) {
                    Map<String, Object> result = (Map<String, Object>) obj;
                    formattedResults.add(result);
                }
                
                return new ResponseWrapper(true, 'Success', formattedResults);
            } else {
                return new ResponseWrapper(false, 'API call failed with status: ' + response.getStatusCode(), null);
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
