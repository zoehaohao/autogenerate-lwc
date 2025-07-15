public with sharing class abnLookupWorkingExampleController {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            if (String.isBlank(searchParams)) {
                return new ResponseWrapper(false, 'Search parameters are required', null);
            }
            
            // Parse search parameters
            Object tempParams = JSON.deserializeUntyped(searchParams);
            Map<String, Object> params = (Map<String, Object>) tempParams;
            
            String searchTerm = (String) params.get('searchTerm');
            String searchType = (String) params.get('searchType');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate search term based on type
            String validationError = validateSearchTerm(searchTerm, searchType);
            if (String.isNotBlank(validationError)) {
                return new ResponseWrapper(false, validationError, null);
            }
            
            // Build API request
            HttpRequest request = buildApiRequest(searchTerm, searchType);
            
            // Make API call
            Http http = new Http();
            HttpResponse response = http.send(request);
            
            // Process response
            return processApiResponse(response);
            
        } catch (Exception e) {
            System.debug('ABN Search Error: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred: ' + e.getMessage(), null);
        }
    }
    
    private static String validateSearchTerm(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return 'Search term cannot be empty';
        }
        
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        switch on searchType {
            when 'ABN' {
                if (!Pattern.matches('^\\d{11}$', cleanTerm)) {
                    return 'ABN must be exactly 11 digits';
                }
            }
            when 'ACN' {
                if (!Pattern.matches('^\\d{9}$', cleanTerm)) {
                    return 'ACN must be exactly 9 digits';
                }
            }
            when 'NAME' {
                if (searchTerm.trim().length() < 2) {
                    return 'Company name must be at least 2 characters';
                }
            }
            when else {
                return 'Invalid search type';
            }
        }
        
        return null;
    }
    
    private static HttpRequest buildApiRequest(String searchTerm, String searchType) {
        HttpRequest request = new HttpRequest();
        request.setEndpoint(buildApiUrl(searchTerm, searchType));
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        return request;
    }
    
    private static String buildApiUrl(String searchTerm, String searchType) {
        String baseUrl = API_ENDPOINT;
        String encodedTerm = EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
        
        switch on searchType {
            when 'ABN' {
                return baseUrl + '?abn=' + encodedTerm;
            }
            when 'ACN' {
                return baseUrl + '?acn=' + encodedTerm;
            }
            when 'NAME' {
                return baseUrl + '?name=' + encodedTerm;
            }
            when else {
                return baseUrl + '?name=' + encodedTerm;
            }
        }
    }
    
    private static ResponseWrapper processApiResponse(HttpResponse response) {
        try {
            if (response.getStatusCode() == 200) {
                String responseBody = response.getBody();
                
                if (String.isBlank(responseBody)) {
                    return new ResponseWrapper(false, 'Empty response from API', null);
                }
                
                // Parse JSON response safely
                Object tempData = JSON.deserializeUntyped(responseBody);
                
                if (tempData == null) {
                    return new ResponseWrapper(false, 'No data returned from search', null);
                }
                
                // Check if response is an array or single object
                if (tempData instanceof List<Object>) {
                    List<Object> tempList = (List<Object>) tempData;
                    List<Map<String, Object>> results = new List<Map<String, Object>>();
                    
                    for (Object item : tempList) {
                        if (item instanceof Map<String, Object>) {
                            results.add((Map<String, Object>) item);
                        }
                    }
                    
                    return new ResponseWrapper(true, 'Search completed successfully', results);
                } else if (tempData instanceof Map<String, Object>) {
                    Map<String, Object> singleResult = (Map<String, Object>) tempData;
                    return new ResponseWrapper(true, 'Search completed successfully', singleResult);
                } else {
                    return new ResponseWrapper(false, 'Unexpected response format', null);
                }
                
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(false, 'No matching results found', null);
            } else if (response.getStatusCode() >= 500) {
                return new ResponseWrapper(false, 'Server error occurred. Please try again later.', null);
            } else {
                return new ResponseWrapper(false, 'API request failed with status: ' + response.getStatusCode(), null);
            }
            
        } catch (JSONException e) {
            System.debug('JSON Parse Error: ' + e.getMessage());
            return new ResponseWrapper(false, 'Invalid response format from API', null);
        } catch (Exception e) {
            System.debug('Response Processing Error: ' + e.getMessage());
            return new ResponseWrapper(false, 'Error processing API response: ' + e.getMessage(), null);
        }
    }
    
    // Helper method for testing API connectivity
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testApiConnection() {
        try {
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(10000); // 10 second timeout for test
            
            Http http = new Http();
            HttpResponse response = http.send(request);
            
            return new ResponseWrapper(
                response.getStatusCode() < 400,
                'API Status: ' + response.getStatusCode(),
                new Map<String, Object>{
                    'statusCode' => response.getStatusCode(),
                    'endpoint' => API_ENDPOINT
                }
            );
            
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
