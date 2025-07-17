public with sharing class FormMyTestingController {
    
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
            
            // Validate search type and term format
            if (!validateSearchInput(sanitizedTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(sanitizedTerm, searchType);
            
            // Parse and process response
            Object parsedData = parseAPIResponse(apiResponse);
            
            return new ResponseWrapper(true, 'Search completed successfully', parsedData);
            
        } catch (CalloutException e) {
            System.debug('API Callout Error: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('Unexpected Error: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
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
    
    private static String makeAPICall(String searchTerm, String searchType) {
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
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            throw new CalloutException('No results found for the provided search criteria');
        } else {
            throw new CalloutException('API returned status code: ' + response.getStatusCode());
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
        }
        
        return baseURL + queryParam;
    }
    
    private static Object parseAPIResponse(String responseBody) {
        if (String.isBlank(responseBody)) {
            return null;
        }
        
        try {
            // Safe JSON parsing
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
            
        } catch (JSONException e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            throw new CalloutException('Invalid response format from ABN service');
        }
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
    
    // Additional utility methods for testing and debugging
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper validateSearchTerm(String searchTerm, String searchType) {
        try {
            Boolean isValid = validateSearchInput(searchTerm, searchType);
            String message = isValid ? 'Valid input' : 'Invalid input format';
            
            return new ResponseWrapper(isValid, message, null);
        } catch (Exception e) {
            return new ResponseWrapper(false, e.getMessage(), null);
        }
    }
}
