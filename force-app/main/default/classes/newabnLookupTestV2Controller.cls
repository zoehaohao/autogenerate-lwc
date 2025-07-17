public with sharing class newabnLookupTestV2Controller {
    
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
            Object apiResult = performAPICallout(searchTerm, searchType);
            
            if (apiResult != null) {
                return new ResponseWrapper(true, 'Search completed successfully', apiResult);
            } else {
                return new ResponseWrapper(false, 'No results found', null);
            }
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An error occurred while searching: ' + e.getMessage(), null);
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
            String endpoint = buildEndpointWithParams(searchTerm, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('Accept', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                String responseBody = response.getBody();
                
                if (String.isNotBlank(responseBody)) {
                    // Parse JSON response safely
                    Object parsedResponse = JSON.deserializeUntyped(responseBody);
                    return parsedResponse;
                } else {
                    System.debug('Empty response body received');
                    return null;
                }
            } else if (response.getStatusCode() == 404) {
                System.debug('No results found (404)');
                return null;
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode());
                System.debug('API Error - Response: ' + response.getBody());
                throw new CalloutException('API returned error status: ' + response.getStatusCode());
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.debug('General Exception in API callout: ' + e.getMessage());
            throw new CalloutException('Failed to connect to ABN lookup service: ' + e.getMessage());
        }
    }
    
    private static String buildEndpointWithParams(String searchTerm, String searchType) {
        String baseEndpoint = API_ENDPOINT;
        String encodedSearchTerm = EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
        
        // Build query parameters based on search type
        switch on searchType {
            when 'abn' {
                return baseEndpoint + '?abn=' + encodedSearchTerm;
            }
            when 'acn' {
                return baseEndpoint + '?acn=' + encodedSearchTerm;
            }
            when 'name' {
                return baseEndpoint + '?name=' + encodedSearchTerm;
            }
            when else {
                // Default to name search
                return baseEndpoint + '?name=' + encodedSearchTerm;
            }
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper validateABN(String abnNumber) {
        try {
            if (String.isBlank(abnNumber)) {
                return new ResponseWrapper(false, 'ABN number is required', null);
            }
            
            String cleanABN = abnNumber.replaceAll('\\s', '');
            
            if (!Pattern.matches('^\\d{11}$', cleanABN)) {
                return new ResponseWrapper(false, 'ABN must be exactly 11 digits', null);
            }
            
            // Perform validation callout
            Object validationResult = performAPICallout(cleanABN, 'abn');
            
            if (validationResult != null) {
                return new ResponseWrapper(true, 'ABN validation completed', validationResult);
            } else {
                return new ResponseWrapper(false, 'ABN not found or invalid', null);
            }
            
        } catch (Exception e) {
            System.debug('Error in validateABN: ' + e.getMessage());
            return new ResponseWrapper(false, 'Validation failed: ' + e.getMessage(), null);
        }
    }
    
    // Utility method for testing API connectivity
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testAPIConnection() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(10000); // 10 second timeout for test
            
            HttpResponse response = http.send(request);
            
            Map<String, Object> testResult = new Map<String, Object>();
            testResult.put('statusCode', response.getStatusCode());
            testResult.put('status', response.getStatus());
            testResult.put('endpoint', API_ENDPOINT);
            testResult.put('timestamp', System.now());
            
            if (response.getStatusCode() == 200 || response.getStatusCode() == 400) {
                // 400 might be expected for test without parameters
                return new ResponseWrapper(true, 'API connection successful', testResult);
            } else {
                return new ResponseWrapper(false, 'API connection failed', testResult);
            }
            
        } catch (Exception e) {
            System.debug('API connection test failed: ' + e.getMessage());
            return new ResponseWrapper(false, 'Connection test failed: ' + e.getMessage(), null);
        }
    }
    
    // Response wrapper class
    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Object data;
        @AuraEnabled public List<String> errors;
        @AuraEnabled public DateTime timestamp;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = new List<String>();
            this.timestamp = System.now();
        }
        
        public ResponseWrapper(Boolean success, String message, Object data, List<String> errors) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = errors != null ? errors : new List<String>();
            this.timestamp = System.now();
        }
    }
    
    // Custom exception for better error handling
    public class ABNLookupException extends Exception {}
}
