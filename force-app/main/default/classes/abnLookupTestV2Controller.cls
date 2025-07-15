public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, String searchType) {
        try {
            // Input validation and sanitization
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            String sanitizedSearchTerm = sanitizeInput(searchTerm.trim());
            
            // Validate search type and format
            if (!validateSearchInput(sanitizedSearchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search format for the specified search type', null);
            }
            
            // Make API callout
            HttpResponse response = makeAPICallout(sanitizedSearchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                // Parse and process response
                Object responseData = parseAPIResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', responseData);
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            } else {
                return new ResponseWrapper(false, 'API returned error: ' + response.getStatus(), null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred: ' + e.getMessage(), null);
        }
    }
    
    private static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        // Remove potentially harmful characters while preserving valid business name characters
        String sanitized = input.replaceAll('[<>"\';\\\\]', '');
        
        // Limit length to prevent abuse
        if (sanitized.length() > 200) {
            sanitized = sanitized.substring(0, 200);
        }
        
        return sanitized;
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm) || String.isBlank(searchType)) {
            return false;
        }
        
        switch (searchType.toLowerCase()) {
            case 'abn':
                return Pattern.matches('^\\d{11}$', searchTerm);
            case 'acn':
                return Pattern.matches('^\\d{9}$', searchTerm);
            case 'companyname':
                return searchTerm.length() >= 2 && searchTerm.length() <= 200;
            default:
                return false;
        }
    }
    
    private static HttpResponse makeAPICallout(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = buildEndpointURL(searchTerm, searchType);
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        System.debug('Making API call to: ' + endpoint);
        
        HttpResponse response = http.send(request);
        
        System.debug('API Response Status: ' + response.getStatusCode());
        System.debug('API Response Body: ' + response.getBody());
        
        return response;
    }
    
    private static String buildEndpointURL(String searchTerm, String searchType) {
        String baseURL = API_ENDPOINT;
        String queryParam = '';
        
        switch (searchType.toLowerCase()) {
            case 'abn':
                queryParam = '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
            case 'acn':
                queryParam = '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
            case 'companyname':
                queryParam = '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
        }
        
        return baseURL + queryParam;
    }
    
    private static Object parseAPIResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return new List<Object>();
            }
            
            // Safe JSON parsing
            Object tempData = JSON.deserializeUntyped(responseBody);
            
            if (tempData == null) {
                return new List<Object>();
            }
            
            // Handle both single object and array responses
            if (tempData instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempData;
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        results.add((Map<String, Object>) item);
                    }
                }
                
                return results;
            } else if (tempData instanceof Map<String, Object>) {
                // Single result - wrap in list for consistency
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                results.add((Map<String, Object>) tempData);
                return results;
            }
            
            return new List<Object>();
            
        } catch (JSONException e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN service');
        }
    }
    
    // Test method for API connectivity
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testAPIConnection() {
        try {
            HttpResponse response = makeAPICallout('44121436162', 'abn');
            
            if (response.getStatusCode() == 200 || response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'API connection successful', null);
            } else {
                return new ResponseWrapper(false, 'API connection failed: ' + response.getStatus(), null);
            }
            
        } catch (Exception e) {
            return new ResponseWrapper(false, 'API connection test failed: ' + e.getMessage(), null);
        }
    }
    
    // Utility method for getting search statistics
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getSearchStatistics() {
        Map<String, Object> stats = new Map<String, Object>();
        stats.put('supportedSearchTypes', new List<String>{'ABN', 'ACN', 'Company Name'});
        stats.put('abnFormat', '11 digits');
        stats.put('acnFormat', '9 digits');
        stats.put('companyNameMinLength', 2);
        stats.put('apiTimeout', TIMEOUT_SECONDS);
        
        return stats;
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
}
