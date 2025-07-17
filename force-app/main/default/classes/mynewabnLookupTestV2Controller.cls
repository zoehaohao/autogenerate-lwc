public with sharing class mynewabnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            if (String.isBlank(searchParams)) {
                return new ResponseWrapper(false, 'Search parameters are required', null);
            }
            
            Map<String, Object> params = parseSearchParams(searchParams);
            if (params == null) {
                return new ResponseWrapper(false, 'Invalid search parameters', null);
            }
            
            String searchTerm = (String) params.get('searchTerm');
            String searchType = (String) params.get('searchType');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate search parameters
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Perform API callout
            Object apiResponse = performAPICallout(searchTerm, searchType);
            
            if (apiResponse == null) {
                return new ResponseWrapper(false, 'No matching results found, please check the inputs and try again.', null);
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', apiResponse);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            
            String errorMessage = 'An error occurred while searching. Please try again.';
            if (e instanceof CalloutException) {
                errorMessage = 'Unable to connect to ABN service. Please try again later.';
            }
            
            return new ResponseWrapper(false, errorMessage, null);
        }
    }
    
    private static Map<String, Object> parseSearchParams(String searchParams) {
        try {
            Object tempResult = JSON.deserializeUntyped(searchParams);
            return (Map<String, Object>) tempResult;
        } catch (Exception e) {
            System.debug('Error parsing search parameters: ' + e.getMessage());
            return null;
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
                return searchTerm.trim().length() >= 2;
            }
            when else {
                return searchTerm.trim().length() >= 2;
            }
        }
    }
    
    private static Object performAPICallout(String searchTerm, String searchType) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameters
            String endpoint = buildEndpointURL(searchTerm, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                String responseBody = response.getBody();
                if (String.isNotBlank(responseBody)) {
                    return parseAPIResponse(responseBody);
                }
            } else if (response.getStatusCode() == 404) {
                // No results found - return null to indicate no matches
                return null;
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode());
                System.debug('API Error - Response: ' + response.getBody());
                throw new CalloutException('API returned status code: ' + response.getStatusCode());
            }
            
            return null;
            
        } catch (CalloutException e) {
            System.debug('Callout exception: ' + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.debug('Unexpected error in API callout: ' + e.getMessage());
            throw new CalloutException('Failed to connect to ABN service');
        }
    }
    
    private static String buildEndpointURL(String searchTerm, String searchType) {
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
                endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
            }
            when else {
                // Default to name search
                endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
            }
        }
        
        return endpoint;
    }
    
    private static Object parseAPIResponse(String responseBody) {
        try {
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            // Handle both single object and array responses
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                List<Map<String, Object>> resultList = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        resultList.add((Map<String, Object>) item);
                    }
                }
                
                return resultList;
            } else if (tempResult instanceof Map<String, Object>) {
                return (Map<String, Object>) tempResult;
            }
            
            return tempResult;
            
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            System.debug('Response body: ' + responseBody);
            throw new CalloutException('Invalid response format from ABN service');
        }
    }
    
    // Test method for API connectivity
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testAPIConnection() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT + '?test=true');
            request.setMethod('GET');
            request.setTimeout(10000); // 10 second timeout for test
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200 || response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'API connection successful', null);
            } else {
                return new ResponseWrapper(false, 'API connection failed with status: ' + response.getStatusCode(), null);
            }
            
        } catch (Exception e) {
            return new ResponseWrapper(false, 'API connection test failed: ' + e.getMessage(), null);
        }
    }
    
    // Utility method for input sanitization
    private static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        // Remove potentially harmful characters while preserving valid business name characters
        String sanitized = input.replaceAll('[<>"\';\\\\]', '');
        return sanitized.trim();
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
            this.timestamp = DateTime.now().format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        }
        
        public ResponseWrapper(Boolean success, String message, Object data, List<String> errors) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = errors != null ? errors : new List<String>();
            this.timestamp = DateTime.now().format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        }
    }
    
    // Exception classes for better error handling
    public class ABNLookupException extends Exception {}
    public class ValidationException extends Exception {}
}
