public with sharing class NEWabnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            if (String.isBlank(searchParams)) {
                return new ResponseWrapper(false, 'Search parameters are required', null);
            }
            
            // Parse search parameters
            Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(searchParams);
            String searchTerm = (String) params.get('searchTerm');
            String searchType = (String) params.get('searchType');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate input based on search type
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Perform API callout
            Object apiResponse = performAPICallout(searchTerm, searchType);
            
            if (apiResponse == null) {
                return new ResponseWrapper(false, 'No results found', null);
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', apiResponse);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            
            String errorMessage = 'An error occurred while searching';
            if (e instanceof CalloutException) {
                errorMessage = 'Unable to connect to ABN lookup service. Please try again later.';
            } else if (e instanceof JSONException) {
                errorMessage = 'Invalid response from ABN lookup service';
            }
            
            return new ResponseWrapper(false, errorMessage, null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        switch on searchType {
            when 'abn' {
                return Pattern.matches('^\\d{11}$', cleanTerm);
            }
            when 'acn' {
                return Pattern.matches('^\\d{9}$', cleanTerm);
            }
            when 'name' {
                return searchTerm.length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static Object performAPICallout(String searchTerm, String searchType) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameters
            String endpoint = buildEndpoint(searchTerm, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            // Perform callout
            HttpResponse response = http.send(request);
            
            // Handle response
            if (response.getStatusCode() == 200) {
                String responseBody = response.getBody();
                
                if (String.isBlank(responseBody)) {
                    return null;
                }
                
                // Parse JSON response safely
                Object parsedResponse = JSON.deserializeUntyped(responseBody);
                
                // Handle different response formats
                if (parsedResponse instanceof List<Object>) {
                    List<Object> responseList = (List<Object>) parsedResponse;
                    return responseList.isEmpty() ? null : responseList;
                } else if (parsedResponse instanceof Map<String, Object>) {
                    Map<String, Object> responseMap = (Map<String, Object>) parsedResponse;
                    return responseMap.isEmpty() ? null : responseMap;
                }
                
                return parsedResponse;
                
            } else if (response.getStatusCode() == 404) {
                return null; // No results found
            } else {
                throw new CalloutException('API returned status code: ' + response.getStatusCode());
            }
            
        } catch (System.CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.debug('Unexpected error in API callout: ' + e.getMessage());
            throw new CalloutException('Failed to perform ABN lookup: ' + e.getMessage());
        }
    }
    
    private static String buildEndpoint(String searchTerm, String searchType) {
        String endpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
        switch on searchType {
            when 'abn' {
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
            }
            when 'acn' {
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
            }
            when 'name' {
                endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
        }
        
        return endpoint;
    }
    
    // Test method for API connectivity
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testConnection() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT + '?test=true');
            request.setMethod('GET');
            request.setTimeout(10000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return new ResponseWrapper(true, 'Connection successful', null);
            } else {
                return new ResponseWrapper(false, 'Connection failed with status: ' + response.getStatusCode(), null);
            }
            
        } catch (Exception e) {
            return new ResponseWrapper(false, 'Connection test failed: ' + e.getMessage(), null);
        }
    }
    
    // Utility method for data sanitization
    private static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        // Remove potentially harmful characters
        String sanitized = input.replaceAll('[<>"\']', '');
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        // Limit length to prevent abuse
        if (sanitized.length() > 255) {
            sanitized = sanitized.substring(0, 255);
        }
        
        return sanitized;
    }
    
    // Response wrapper class
    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Object data;
        @AuraEnabled public List<String> errors;
        @AuraEnabled public String timestamp;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = new List<String>();
            this.timestamp = DateTime.now().formatGMT('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        }
        
        public ResponseWrapper(Boolean success, String message, Object data, List<String> errors) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = errors != null ? errors : new List<String>();
            this.timestamp = DateTime.now().formatGMT('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        }
    }
    
    // Exception classes
    public class ABNLookupException extends Exception {}
    public class ValidationException extends Exception {}
}
