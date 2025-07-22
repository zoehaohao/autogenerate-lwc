public with sharing class nLookupTestV2Controller {
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT = 30000; // 30 seconds

    @AuraEnabled
    public static ResponseWrapper searchABN(String searchTerm) {
        try {
            // Input validation
            if (String.isBlank(searchTerm) || searchTerm.length() < 2) {
                return new ResponseWrapper(false, 'Search term must be at least 2 characters', null);
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
                return processSuccessResponse(response.getBody());
            } else {
                return processErrorResponse(response);
            }
        } catch (Exception e) {
            return new ResponseWrapper(false, 'An error occurred: ' + e.getMessage(), null);
        }
    }

    private static ResponseWrapper processSuccessResponse(String responseBody) {
        try {
            // Safe JSON parsing
            Object parsedData = JSON.deserializeUntyped(responseBody);
            if (parsedData instanceof List<Object>) {
                return new ResponseWrapper(true, 'Success', parsedData);
            } else {
                return new ResponseWrapper(false, 'Invalid response format', null);
            }
        } catch (Exception e) {
            return new ResponseWrapper(false, 'Error processing response: ' + e.getMessage(), null);
        }
    }

    private static ResponseWrapper processErrorResponse(HttpResponse response) {
        String errorMessage = 'HTTP Error ' + response.getStatusCode();
        try {
            Map<String, Object> errorResponse = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
            if (errorResponse.containsKey('message')) {
                errorMessage = String.valueOf(errorResponse.get('message'));
            }
        } catch (Exception e) {
            // Use default error message if can't parse response
        }
        return new ResponseWrapper(false, errorMessage, null);
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
