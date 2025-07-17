public with sharing class newLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchData) {
        try {
            if (String.isBlank(searchData)) {
                return new ResponseWrapper(false, 'Search data is required', null);
            }
            
            // Parse search data
            Object tempData = JSON.deserializeUntyped(searchData);
            Map<String, Object> searchParams = (Map<String, Object>) tempData;
            
            String searchTerm = (String) searchParams.get('searchTerm');
            String searchType = (String) searchParams.get('searchType');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate input based on search type
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Make API call
            HttpResponse response = makeAPICall(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                // Parse response
                Object responseData = parseAPIResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', responseData);
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'Search service temporarily unavailable', null);
            }
            
        } catch (System.CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to search service', null);
        } catch (Exception e) {
            System.debug('Unexpected Error: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred', null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String cleanTerm = searchTerm.trim();
        
        switch on searchType {
            when 'ABN' {
                return Pattern.matches('^\\d{11}$', cleanTerm);
            }
            when 'ACN' {
                return Pattern.matches('^\\d{9}$', cleanTerm);
            }
            when 'NAME' {
                return cleanTerm.length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static HttpResponse makeAPICall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        String queryParam = buildQueryParameter(searchTerm, searchType);
        
        if (String.isNotBlank(queryParam)) {
            endpoint += '?' + queryParam;
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        System.debug('Making API call to: ' + endpoint);
        
        return http.send(request);
    }
    
    private static String buildQueryParameter(String searchTerm, String searchType) {
        // Build query parameter based on search type
        switch on searchType {
            when 'ABN' {
                return 'abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'ACN' {
                return 'acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'NAME' {
                return 'name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when else {
                return '';
            }
        }
    }
    
    private static Object parseAPIResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return new List<Object>();
            }
            
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            // Handle both single object and array responses
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        results.add((Map<String, Object>) item);
                    }
                }
                
                return results;
            } else if (tempResult instanceof Map<String, Object>) {
                // Single result - wrap in list for consistency
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                results.add((Map<String, Object>) tempResult);
                return results;
            } else {
                System.debug('Unexpected response format: ' + responseBody);
                return new List<Object>();
            }
            
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            System.debug('Response body: ' + responseBody);
            throw new AuraHandledException('Invalid response format from search service');
        }
    }
    
    // Helper method to sanitize input
    private static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        return input.trim()
                   .replaceAll('[^a-zA-Z0-9\\s\\-\\.]', '')
                   .left(255); // Limit length
    }
    
    // Response wrapper class
    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Object data;
        @AuraEnabled public List<String> errors;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = new List<String>();
        }
        
        public ResponseWrapper(Boolean success, String message, Object data, List<String> errors) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = errors != null ? errors : new List<String>();
        }
    }
}
