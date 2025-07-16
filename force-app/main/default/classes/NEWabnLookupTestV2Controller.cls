public with sharing class NEWabnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(Map<String, Object> searchParams) {
        try {
            // Validate input parameters
            if (searchParams == null || !searchParams.containsKey('searchTerm') || !searchParams.containsKey('searchType')) {
                return new ResponseWrapper(false, 'Missing required search parameters', null);
            }
            
            String searchTerm = String.valueOf(searchParams.get('searchTerm')).trim();
            String searchType = String.valueOf(searchParams.get('searchType'));
            
            // Validate search term
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term cannot be empty', null);
            }
            
            // Perform validation based on search type
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Make API call
            HttpResponse response = makeAPICall(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                // Parse and process response
                Object responseData = parseAPIResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', responseData);
            } else {
                String errorMessage = handleHTTPError(response.getStatusCode(), response.getBody());
                return new ResponseWrapper(false, errorMessage, null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please contact your administrator.', null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        switch on searchType {
            when 'abn' {
                return Pattern.matches('^\\d{11}$', searchTerm);
            }
            when 'acn' {
                return Pattern.matches('^\\d{9}$', searchTerm);
            }
            when 'name' {
                return searchTerm.length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static HttpResponse makeAPICall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        Map<String, String> queryParams = buildQueryParameters(searchTerm, searchType);
        
        if (!queryParams.isEmpty()) {
            List<String> paramStrings = new List<String>();
            for (String key : queryParams.keySet()) {
                paramStrings.add(key + '=' + EncodingUtil.urlEncode(queryParams.get(key), 'UTF-8'));
            }
            endpoint += '?' + String.join(paramStrings, '&');
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        System.debug('API Request Endpoint: ' + endpoint);
        
        return http.send(request);
    }
    
    private static Map<String, String> buildQueryParameters(String searchTerm, String searchType) {
        Map<String, String> params = new Map<String, String>();
        
        switch on searchType {
            when 'abn' {
                params.put('abn', searchTerm);
            }
            when 'acn' {
                params.put('acn', searchTerm);
            }
            when 'name' {
                params.put('name', searchTerm);
            }
        }
        
        return params;
    }
    
    private static Object parseAPIResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return null;
            }
            
            // Safe JSON parsing
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            if (tempResult == null) {
                return null;
            }
            
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
            throw new AuraHandledException('Invalid response format from ABN service');
        }
    }
    
    private static String handleHTTPError(Integer statusCode, String responseBody) {
        switch on statusCode {
            when 400 {
                return 'Invalid search request. Please check your input and try again.';
            }
            when 401 {
                return 'Authentication failed. Please contact your administrator.';
            }
            when 403 {
                return 'Access denied. Please contact your administrator.';
            }
            when 404 {
                return 'ABN service not found. Please try again later.';
            }
            when 429 {
                return 'Too many requests. Please wait a moment and try again.';
            }
            when 500 {
                return 'ABN service is temporarily unavailable. Please try again later.';
            }
            when 503 {
                return 'ABN service is under maintenance. Please try again later.';
            }
            when else {
                return 'Unable to complete search (Error: ' + statusCode + '). Please try again.';
            }
        }
    }
    
    // Test method for API connectivity
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testConnection() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(10000); // 10 second timeout for test
            
            HttpResponse response = http.send(request);
            
            return new ResponseWrapper(
                response.getStatusCode() < 400,
                'Connection test completed. Status: ' + response.getStatusCode(),
                new Map<String, Object>{
                    'statusCode' => response.getStatusCode(),
                    'status' => response.getStatus()
                }
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
}
