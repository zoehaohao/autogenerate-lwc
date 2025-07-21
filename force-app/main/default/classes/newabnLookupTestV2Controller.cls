public with sharing class newabnLookupTestV2Controller {
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT = 30000; // 30 seconds

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
            request.setEndpoint(API_ENDPOINT + '?q=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            request.setMethod('GET');
            request.setTimeout(TIMEOUT);

            // Make the callout
            HttpResponse response = http.send(request);

            // Process response
            if (response.getStatusCode() == 200) {
                Object parsedResponse = safelyParseJSON(response.getBody());
                if (parsedResponse != null) {
                    return new ResponseWrapper(true, 'Success', parsedResponse);
                }
                return new ResponseWrapper(false, 'Invalid response format', null);
            }
            
            return new ResponseWrapper(
                false, 
                'API Error: ' + response.getStatusCode() + ' ' + response.getStatus(), 
                null
            );

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error in searchABN: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred', null);
        }
    }

    private static Object safelyParseJSON(String jsonString) {
        try {
            return JSON.deserializeUntyped(jsonString);
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'JSON parsing error: ' + e.getMessage());
            return null;
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
