public with sharing class newabnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, String searchType) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Sanitize input
            String sanitizedTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Validate search type and format
            if (!validateSearchInput(sanitizedTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search format for ' + searchType, null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(sanitizedTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response received from API', null);
            }
            
            // Parse response
            Object parsedData = parseAPIResponse(apiResponse);
            
            if (parsedData == null) {
                return new ResponseWrapper(false, 'No matching results found', null);
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', parsedData);
            
        } catch (Exception e) {
            System.debug('ABN Search Error: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            
            // Return user-friendly error message
            String userMessage = 'An error occurred while searching. Please try again.';
            if (e instanceof CalloutException) {
                userMessage = 'Unable to connect to ABN service. Please check your connection and try again.';
            }
            
            return new ResponseWrapper(false, userMessage, null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        switch on searchType {
            when 'ABN' {
                return Pattern.matches('^\\d{11}$', cleanTerm);
            }
            when 'ACN' {
                return Pattern.matches('^\\d{9}$', cleanTerm);
            }
            when 'NAME' {
                return searchTerm.length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static String makeAPICall(String searchTerm, String searchType) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameters
            String endpoint = buildEndpoint(searchTerm, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('Accept', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return response.getBody();
            } else if (response.getStatusCode() == 404) {
                System.debug('API returned 404 - No results found');
                return null;
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode());
                System.debug('API Error - Response: ' + response.getBody());
                throw new CalloutException('API returned status code: ' + response.getStatusCode());
            }
            
        } catch (Exception e) {
            System.debug('HTTP Callout Error: ' + e.getMessage());
            throw e;
        }
    }
    
    private static String buildEndpoint(String searchTerm, String searchType) {
        String baseEndpoint = API_ENDPOINT;
        String queryParam = '';
        
        switch on searchType {
            when 'ABN' {
                queryParam = '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'ACN' {
                queryParam = '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'NAME' {
                queryParam = '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
        }
        
        return baseEndpoint + queryParam;
    }
    
    private static Object parseAPIResponse(String jsonResponse) {
        try {
            if (String.isBlank(jsonResponse)) {
                return null;
            }
            
            // Safe JSON parsing
            Object tempData = JSON.deserializeUntyped(jsonResponse);
            
            if (tempData == null) {
                return null;
            }
            
            // Handle both single object and array responses
            if (tempData instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempData;
                if (tempList.isEmpty()) {
                    return null;
                }
                
                List<Map<String, Object>> resultList = new List<Map<String, Object>>();
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        resultList.add((Map<String, Object>) item);
                    }
                }
                return resultList;
            } else if (tempData instanceof Map<String, Object>) {
                Map<String, Object> dataMap = (Map<String, Object>) tempData;
                
                // Check if the response indicates no results
                if (dataMap.isEmpty() || isEmptyResult(dataMap)) {
                    return null;
                }
                
                return dataMap;
            }
            
            return null;
            
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            throw new AuraHandledException('Failed to parse API response');
        }
    }
    
    private static Boolean isEmptyResult(Map<String, Object> dataMap) {
        // Check for common indicators of empty/invalid results
        if (dataMap.containsKey('error') || dataMap.containsKey('errors')) {
            return true;
        }
        
        // Check if ABN data exists and is valid
        if (dataMap.containsKey('abn')) {
            Object abnData = dataMap.get('abn');
            if (abnData instanceof Map<String, Object>) {
                Map<String, Object> abnMap = (Map<String, Object>) abnData;
                String identifierValue = (String) abnMap.get('identifier_value');
                return String.isBlank(identifierValue);
            }
        }
        
        return false;
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
    
    // Test method for API validation
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testAPIConnection() {
        try {
            // Test with a sample ABN
            return searchABN('44121436162', 'ABN');
        } catch (Exception e) {
            return new ResponseWrapper(false, 'API connection test failed: ' + e.getMessage(), null);
        }
    }
}
