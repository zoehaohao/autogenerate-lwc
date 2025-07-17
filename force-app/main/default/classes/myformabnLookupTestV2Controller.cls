public with sharing class myformabnLookupTestV2Controller {
    
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
            return new ResponseWrapper(false, 'An error occurred while searching: ' + e.getMessage(), null);
        }
    }
    
    private static Map<String, Object> parseSearchParams(String searchParams) {
        try {
            Object tempData = JSON.deserializeUntyped(searchParams);
            return (Map<String, Object>) tempData;
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
        
        switch (searchType) {
            case 'abn':
                return Pattern.matches('^\\d{11}$', cleanTerm);
            case 'acn':
                return Pattern.matches('^\\d{9}$', cleanTerm);
            case 'name':
                return searchTerm.trim().length() >= 2;
            default:
                return searchTerm.trim().length() >= 2;
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
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return parseAPIResponse(response.getBody());
            } else if (response.getStatusCode() == 404) {
                System.debug('No results found for search term: ' + searchTerm);
                return null;
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                throw new CalloutException('API returned error: ' + response.getStatusCode());
            }
            
        } catch (System.CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            throw new CalloutException('Unable to connect to ABN lookup service: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('Unexpected error during API callout: ' + e.getMessage());
            throw new CalloutException('An unexpected error occurred: ' + e.getMessage());
        }
    }
    
    private static String buildEndpoint(String searchTerm, String searchType) {
        String endpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
        switch (searchType) {
            case 'abn':
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
                break;
            case 'acn':
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
                break;
            case 'name':
                endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
                break;
            default:
                endpoint += '?q=' + EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
        }
        
        return endpoint;
    }
    
    private static Object parseAPIResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return null;
            }
            
            Object tempResponse = JSON.deserializeUntyped(responseBody);
            
            // Handle both single object and array responses
            if (tempResponse instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResponse;
                List<Map<String, Object>> resultList = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        resultList.add((Map<String, Object>) item);
                    }
                }
                
                return resultList;
            } else if (tempResponse instanceof Map<String, Object>) {
                return (Map<String, Object>) tempResponse;
            }
            
            return tempResponse;
            
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            System.debug('Response body: ' + responseBody);
            throw new CalloutException('Invalid response format from ABN lookup service');
        }
    }
    
    // Utility method for testing
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testConnection() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT);
            request.setMethod('GET');
            request.setTimeout(10000);
            
            HttpResponse response = http.send(request);
            
            return new ResponseWrapper(
                response.getStatusCode() == 200, 
                'Status Code: ' + response.getStatusCode(), 
                response.getBody()
            );
            
        } catch (Exception e) {
            return new ResponseWrapper(false, 'Connection test failed: ' + e.getMessage(), null);
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
    
    // Custom exception class
    public class CalloutException extends Exception {}
}
