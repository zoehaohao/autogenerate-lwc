public with sharing class newabnLookupTestV2Controller {
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT = 30000; // 30 seconds

    @AuraEnabled
    public static ResponseWrapper searchABN(String searchTerm, String searchType) {
        try {
            // Validate input
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term cannot be empty', null);
            }

            // Prepare HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT + buildQueryString(searchTerm, searchType));
            request.setMethod('GET');
            request.setTimeout(TIMEOUT);

            // Send request
            HttpResponse response = http.send(request);

            // Process response
            if (response.getStatusCode() == 200) {
                return processSuccessResponse(response.getBody());
            } else {
                return processErrorResponse(response);
            }
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error in searchABN: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred', null);
        }
    }

    private static String buildQueryString(String searchTerm, String searchType) {
        String queryParam;
        switch on searchType {
            when 'ABN' {
                queryParam = 'abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'ACN' {
                queryParam = 'acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when else {
                queryParam = 'name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
        }
        return '?' + queryParam;
    }

    private static ResponseWrapper processSuccessResponse(String responseBody) {
        try {
            Object parsedResponse = JSON.deserializeUntyped(responseBody);
            if (parsedResponse instanceof List<Object>) {
                return new ResponseWrapper(true, 'Success', parsedResponse);
            } else if (parsedResponse instanceof Map<String, Object>) {
                List<Object> resultList = new List<Object>{parsedResponse};
                return new ResponseWrapper(true, 'Success', resultList);
            }
            return new ResponseWrapper(false, 'Invalid response format', null);
        } catch (Exception e) {
            return new ResponseWrapper(false, 'Error processing response', null);
        }
    }

    private static ResponseWrapper processErrorResponse(HttpResponse response) {
        String message = 'Error: HTTP ' + response.getStatusCode();
        try {
            Map<String, Object> errorResponse = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
            if (errorResponse.containsKey('message')) {
                message = String.valueOf(errorResponse.get('message'));
            }
        } catch (Exception e) {
            // Use default error message if can't parse response
        }
        return new ResponseWrapper(false, message, null);
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
