public with sharing class strandsTestV12Controller {
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT = 30000; // 30 seconds

    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public List<Object> data;
        
        public ResponseWrapper(Boolean success, String message, List<Object> data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
    }

    @AuraEnabled
    public static ResponseWrapper searchBusinesses(String searchTerm, String searchType) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term cannot be empty', null);
            }

            // Sanitize input
            searchTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Prepare HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT + '?query=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            request.setMethod('GET');
            request.setTimeout(TIMEOUT);
            
            // Make API call
            HttpResponse response = http.send(request);
            
            // Process response
            if (response.getStatusCode() == 200) {
                Object parsedResponse = JSON.deserializeUntyped(response.getBody());
                
                if (parsedResponse instanceof List<Object>) {
                    return new ResponseWrapper(true, 'Success', (List<Object>)parsedResponse);
                } else if (parsedResponse instanceof Map<String, Object>) {
                    List<Object> resultList = new List<Object>();
                    resultList.add(parsedResponse);
                    return new ResponseWrapper(true, 'Success', resultList);
                }
                
                return new ResponseWrapper(false, 'Invalid response format', null);
            }
            
            return new ResponseWrapper(
                false, 
                'API Error: ' + response.getStatusCode() + ' ' + response.getStatus(), 
                null
            );
            
        } catch (Exception e) {
            System.debug('Error in searchBusinesses: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred: ' + e.getMessage(), null);
        }
    }
}