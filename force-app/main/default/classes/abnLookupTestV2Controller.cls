public with sharing class abnLookupTestV2Controller {
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    
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
            request.setEndpoint(API_ENDPOINT);
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout

            // Add search parameter
            String searchType = determineSearchType(searchTerm);
            String encodedTerm = EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
            request.setEndpoint(API_ENDPOINT + '?' + searchType + '=' + encodedTerm);

            // Execute callout
            HttpResponse response = http.send(request);

            // Process response with safe JSON parsing
            if (response.getStatusCode() == 200) {
                try {
                    Object parsedData = JSON.deserializeUntyped(response.getBody());
                    return new ResponseWrapper(true, 'Success', parsedData);
                } catch (JSONException e) {
                    return new ResponseWrapper(false, 'Invalid response format: ' + e.getMessage(), null);
                }
            } else {
                return new ResponseWrapper(
                    false, 
                    'API Error: ' + response.getStatusCode() + ' - ' + response.getStatus(), 
                    null
                );
            }

        } catch (Exception e) {
            // Log error for debugging
            System.debug(LoggingLevel.ERROR, 'ABN Lookup Error: ' + e.getMessage());
            return new ResponseWrapper(false, 'System Error: ' + e.getMessage(), null);
        }
    }

    private static String determineSearchType(String searchTerm) {
        if (String.isBlank(searchTerm)) return 'name';
        
        // Remove non-alphanumeric characters
        String cleanTerm = searchTerm.replaceAll('[^a-zA-Z0-9]', '');
        
        if (cleanTerm.length() == 11 && cleanTerm.isNumeric()) {
            return 'abn';
        } else if (cleanTerm.length() == 9 && cleanTerm.isNumeric()) {
            return 'acn';
        }
        return 'name';
    }

    public class ResponseWrapper {
        @AuraEnabled public Boolean success { get; set; }
        @AuraEnabled public String message { get; set; }
        @AuraEnabled public Object data { get; set; }
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
    }
}
