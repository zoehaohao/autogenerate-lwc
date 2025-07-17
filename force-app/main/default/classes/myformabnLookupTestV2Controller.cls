public with sharing class myformabnLookupTestV2Controller {
    
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
            String apiResponse = performAPICallout(searchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response received from ABN service', null);
            }
            
            // Parse and process response
            Object processedData = processAPIResponse(apiResponse);
            
            return new ResponseWrapper(true, 'Search completed successfully', processedData);
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('Search Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An error occurred during search. Please try again.', null);
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
                return searchTerm.length() >= 2;
            }
        }
    }
    
    private static String performAPICallout(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = buildEndpointURL(searchTerm, searchType);
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        try {
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return response.getBody();
            } else if (response.getStatusCode() == 404) {
                return '{"error": "No results found"}';
            } else {
                throw new CalloutException('HTTP ' + response.getStatusCode() + ': ' + response.getStatus());
            }
        } catch (System.CalloutException e) {
            throw new CalloutException('API request failed: ' + e.getMessage());
        }
    }
    
    private static String buildEndpointURL(String searchTerm, String searchType) {
        String baseURL = API_ENDPOINT;
        String queryParam = '';
        
        switch on searchType {
            when 'abn' {
                queryParam = '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'acn' {
                queryParam = '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'name' {
                queryParam = '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when else {
                queryParam = '?q=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
        }
        
        return baseURL + queryParam;
    }
    
    private static Object processAPIResponse(String apiResponse) {
        try {
            // Check for error response
            if (apiResponse.contains('"error"')) {
                Map<String, Object> errorResponse = (Map<String, Object>) JSON.deserializeUntyped(apiResponse);
                if (errorResponse.containsKey('error')) {
                    return null; // Return null for no results found
                }
            }
            
            // Parse the JSON response safely
            Object tempResult = JSON.deserializeUntyped(apiResponse);
            
            // Handle different response formats
            if (tempResult instanceof List<Object>) {
                // Multiple results
                List<Object> tempList = (List<Object>) tempResult;
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        results.add((Map<String, Object>) item);
                    }
                }
                return results;
            } else if (tempResult instanceof Map<String, Object>) {
                // Single result
                return (Map<String, Object>) tempResult;
            } else {
                return tempResult;
            }
            
        } catch (JSONException e) {
            System.debug('JSON Parse Exception: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN service');
        } catch (Exception e) {
            System.debug('Response Processing Exception: ' + e.getMessage());
            throw new AuraHandledException('Error processing ABN service response');
        }
    }
    
    // Test method for API endpoint validation
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper validateAPIEndpoint() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT);
            request.setMethod('GET');
            request.setTimeout(10000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                return new ResponseWrapper(true, 'API endpoint is accessible', null);
            } else {
                return new ResponseWrapper(false, 'API endpoint returned status: ' + response.getStatusCode(), null);
            }
        } catch (Exception e) {
            return new ResponseWrapper(false, 'API endpoint validation failed: ' + e.getMessage(), null);
        }
    }
    
    // Utility method for input sanitization
    @AuraEnabled(cacheable=true)
    public static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        // Remove potentially harmful characters
        String sanitized = input.replaceAll('[<>"\']', '');
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        // Limit length to prevent abuse
        if (sanitized.length() > 100) {
            sanitized = sanitized.substring(0, 100);
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
    
    // Custom exception for callout errors
    public class CalloutException extends Exception {}
}
