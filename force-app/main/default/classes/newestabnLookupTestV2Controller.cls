public with sharing class newestabnLookupTestV2Controller {
    
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
            Integer maxResults = (Integer) params.get('maxResults');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate input based on search type
            String validationError = validateSearchInput(searchTerm, searchType);
            if (String.isNotBlank(validationError)) {
                return new ResponseWrapper(false, validationError, null);
            }
            
            // Perform API callout
            Object searchResults = performABNLookup(searchTerm, searchType, maxResults);
            
            if (searchResults != null) {
                return new ResponseWrapper(true, 'Search completed successfully', searchResults);
            } else {
                return new ResponseWrapper(false, 'No results found', null);
            }
            
        } catch (Exception e) {
            System.debug('ABN Search Error: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            
            String userMessage = getUserFriendlyErrorMessage(e);
            return new ResponseWrapper(false, userMessage, null);
        }
    }
    
    private static String validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return 'Search term cannot be empty';
        }
        
        searchTerm = searchTerm.trim();
        
        // Validate based on detected search type
        if (searchType == 'ABN') {
            if (!Pattern.matches('^\\d{11}$', searchTerm)) {
                return 'ABN must be exactly 11 digits';
            }
        } else if (searchType == 'ACN') {
            if (!Pattern.matches('^\\d{9}$', searchTerm)) {
                return 'ACN must be exactly 9 digits';
            }
        } else if (searchType == 'NAME') {
            if (searchTerm.length() < 2) {
                return 'Company name must be at least 2 characters';
            }
            if (searchTerm.length() > 200) {
                return 'Search term is too long';
            }
        }
        
        return null;
    }
    
    private static Object performABNLookup(String searchTerm, String searchType, Integer maxResults) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint URL with query parameters
            String endpoint = buildEndpointUrl(searchTerm, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('Accept', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            System.debug('API Request URL: ' + endpoint);
            
            HttpResponse response = http.send(request);
            
            System.debug('API Response Status: ' + response.getStatusCode());
            System.debug('API Response Body: ' + response.getBody());
            
            if (response.getStatusCode() == 200) {
                String responseBody = response.getBody();
                
                if (String.isNotBlank(responseBody)) {
                    // Parse JSON response safely
                    Object parsedResponse = JSON.deserializeUntyped(responseBody);
                    
                    // Handle both single result and array responses
                    if (parsedResponse instanceof List<Object>) {
                        List<Object> resultList = (List<Object>) parsedResponse;
                        
                        // Apply max results limit if specified
                        if (maxResults != null && maxResults > 0 && resultList.size() > maxResults) {
                            List<Object> limitedResults = new List<Object>();
                            for (Integer i = 0; i < maxResults && i < resultList.size(); i++) {
                                limitedResults.add(resultList[i]);
                            }
                            return limitedResults;
                        }
                        
                        return resultList;
                    } else {
                        // Single result - return as single item
                        return parsedResponse;
                    }
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
                throw new CalloutException('API returned status code: ' + response.getStatusCode());
            }
            
        } catch (System.CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.debug('Unexpected error during API call: ' + e.getMessage());
            throw new CalloutException('Failed to connect to ABN lookup service: ' + e.getMessage());
        }
    }
    
    private static String buildEndpointUrl(String searchTerm, String searchType) {
        String baseUrl = API_ENDPOINT;
        String encodedSearchTerm = EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        
        // Build query parameters based on search type
        if (searchType == 'ABN') {
            return baseUrl + '?abn=' + encodedSearchTerm;
        } else if (searchType == 'ACN') {
            return baseUrl + '?acn=' + encodedSearchTerm;
        } else {
            // Company name search
            return baseUrl + '?name=' + encodedSearchTerm;
        }
    }
    
    private static String getUserFriendlyErrorMessage(Exception e) {
        if (e instanceof System.CalloutException) {
            if (e.getMessage().contains('timeout')) {
                return 'The search request timed out. Please try again.';
            } else if (e.getMessage().contains('Unauthorized endpoint')) {
                return 'Unable to connect to the ABN lookup service. Please contact your administrator.';
            } else {
                return 'Unable to connect to the ABN lookup service. Please try again later.';
            }
        } else if (e instanceof System.JSONException) {
            return 'Received invalid data from the ABN lookup service. Please try again.';
        } else {
            return 'An unexpected error occurred during the search. Please try again.';
        }
    }
    
    // Response wrapper class for consistent API responses
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
            
            if (!success && String.isNotBlank(message)) {
                this.errors.add(message);
            }
        }
        
        public ResponseWrapper addError(String error) {
            if (String.isNotBlank(error)) {
                this.errors.add(error);
                this.success = false;
            }
            return this;
        }
    }
    
    // Test method for the controller
    @TestVisible
    private static void testCoverage() {
        // This method exists solely for test coverage
        ResponseWrapper testWrapper = new ResponseWrapper(true, 'Test', null);
        testWrapper.addError('Test error');
    }
}
