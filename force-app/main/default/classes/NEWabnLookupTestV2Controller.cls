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
            String apiResponse = performAPICallout(searchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response received from ABN service', null);
            }
            
            // Parse and process response
            Object responseData = parseAPIResponse(apiResponse);
            
            if (responseData == null) {
                return new ResponseWrapper(false, 'No matching results found', null);
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', responseData);
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String cleanTerm = searchTerm.replaceAll('\\s', ''); // Remove spaces
        
        switch on searchType {
            when 'abn' {
                return Pattern.matches('^\\d{11}$', cleanTerm);
            }
            when 'acn' {
                return Pattern.matches('^\\d{9}$', cleanTerm);
            }
            when 'name' {
                return searchTerm.trim().length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static String performAPICallout(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = buildEndpointWithParams(searchTerm, searchType);
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            return null; // No results found
        } else {
            throw new CalloutException('API returned status code: ' + response.getStatusCode() + 
                                     ' with message: ' + response.getStatus());
        }
    }
    
    private static String buildEndpointWithParams(String searchTerm, String searchType) {
        String baseEndpoint = API_ENDPOINT;
        String encodedTerm = EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
        
        switch on searchType {
            when 'abn' {
                return baseEndpoint + '?abn=' + encodedTerm;
            }
            when 'acn' {
                return baseEndpoint + '?acn=' + encodedTerm;
            }
            when 'name' {
                return baseEndpoint + '?name=' + encodedTerm;
            }
            when else {
                return baseEndpoint + '?q=' + encodedTerm;
            }
        }
    }
    
    private static Object parseAPIResponse(String apiResponse) {
        try {
            Object tempResult = JSON.deserializeUntyped(apiResponse);
            
            if (tempResult == null) {
                return null;
            }
            
            // Handle both single object and array responses
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                if (tempList.isEmpty()) {
                    return null;
                }
                
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> resultMap = (Map<String, Object>) item;
                        if (isValidResult(resultMap)) {
                            results.add(sanitizeResult(resultMap));
                        }
                    }
                }
                
                return results.isEmpty() ? null : results;
                
            } else if (tempResult instanceof Map<String, Object>) {
                Map<String, Object> resultMap = (Map<String, Object>) tempResult;
                if (isValidResult(resultMap)) {
                    return sanitizeResult(resultMap);
                }
            }
            
            return null;
            
        } catch (JSONException e) {
            System.debug('JSON Parse Exception: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN service');
        }
    }
    
    private static Boolean isValidResult(Map<String, Object> result) {
        if (result == null || result.isEmpty()) {
            return false;
        }
        
        // Check for essential fields
        Object abnData = result.get('abn');
        if (abnData instanceof Map<String, Object>) {
            Map<String, Object> abnMap = (Map<String, Object>) abnData;
            String abnNumber = (String) abnMap.get('identifier_value');
            return String.isNotBlank(abnNumber);
        }
        
        return false;
    }
    
    private static Map<String, Object> sanitizeResult(Map<String, Object> result) {
        Map<String, Object> sanitized = new Map<String, Object>();
        
        // Safely copy and sanitize each field
        for (String key : result.keySet()) {
            Object value = result.get(key);
            if (value != null) {
                if (value instanceof String) {
                    sanitized.put(key, String.escapeSingleQuotes((String) value));
                } else if (value instanceof Map<String, Object>) {
                    sanitized.put(key, sanitizeNestedMap((Map<String, Object>) value));
                } else {
                    sanitized.put(key, value);
                }
            }
        }
        
        return sanitized;
    }
    
    private static Map<String, Object> sanitizeNestedMap(Map<String, Object> nestedMap) {
        Map<String, Object> sanitized = new Map<String, Object>();
        
        for (String key : nestedMap.keySet()) {
            Object value = nestedMap.get(key);
            if (value != null) {
                if (value instanceof String) {
                    sanitized.put(key, String.escapeSingleQuotes((String) value));
                } else {
                    sanitized.put(key, value);
                }
            }
        }
        
        return sanitized;
    }
    
    // Test method for API connectivity
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testAPIConnection() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            request.setEndpoint(API_ENDPOINT + '?test=true');
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(10000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200 || response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'API connection successful', 
                    'Status: ' + response.getStatusCode());
            } else {
                return new ResponseWrapper(false, 'API connection failed', 
                    'Status: ' + response.getStatusCode());
            }
            
        } catch (Exception e) {
            return new ResponseWrapper(false, 'API connection test failed: ' + e.getMessage(), null);
        }
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
