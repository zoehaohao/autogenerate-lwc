public with sharing class MYabnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, String searchType, Integer pageNumber, Integer pageSize) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Sanitize inputs
            searchTerm = String.escapeSingleQuotes(searchTerm.trim());
            searchType = String.escapeSingleQuotes(searchType);
            
            // Validate search type and format
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search format for the specified search type', null);
            }
            
            // Build API endpoint with query parameters
            String endpoint = buildApiEndpoint(searchTerm, searchType, pageNumber, pageSize);
            
            // Make API callout
            HttpResponse response = makeApiCallout(endpoint);
            
            if (response.getStatusCode() == 200) {
                // Parse response safely
                Object responseData = parseApiResponse(response.getBody());
                SearchResultData resultData = processSearchResults(responseData, searchTerm, pageNumber, pageSize);
                
                return new ResponseWrapper(true, 'Search completed successfully', resultData);
            } else {
                String errorMessage = 'API Error: ' + response.getStatus() + ' (' + response.getStatusCode() + ')';
                System.debug('API Error Response: ' + response.getBody());
                return new ResponseWrapper(false, errorMessage, null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN lookup service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('Unexpected Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please contact your administrator.', null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
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
    
    private static String buildApiEndpoint(String searchTerm, String searchType, Integer pageNumber, Integer pageSize) {
        String endpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
        Map<String, String> params = new Map<String, String>();
        
        switch on searchType {
            when 'abn' {
                params.put('abn', EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            }
            when 'acn' {
                params.put('acn', EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            }
            when 'name' {
                params.put('name', EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            }
        }
        
        // Add pagination parameters
        if (pageNumber != null && pageNumber > 0) {
            params.put('page', String.valueOf(pageNumber));
        }
        if (pageSize != null && pageSize > 0) {
            params.put('limit', String.valueOf(pageSize));
        }
        
        // Build query string
        if (!params.isEmpty()) {
            List<String> paramList = new List<String>();
            for (String key : params.keySet()) {
                paramList.add(key + '=' + params.get(key));
            }
            endpoint += '?' + String.join(paramList, '&');
        }
        
        return endpoint;
    }
    
    private static HttpResponse makeApiCallout(String endpoint) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        return http.send(request);
    }
    
    private static Object parseApiResponse(String responseBody) {
        try {
            return JSON.deserializeUntyped(responseBody);
        } catch (JSONException e) {
            System.debug('JSON Parse Error: ' + e.getMessage());
            System.debug('Response Body: ' + responseBody);
            throw new AuraHandledException('Invalid response format from ABN lookup service');
        }
    }
    
    private static SearchResultData processSearchResults(Object responseData, String searchTerm, Integer pageNumber, Integer pageSize) {
        SearchResultData resultData = new SearchResultData();
        
        if (responseData == null) {
            return resultData;
        }
        
        try {
            // Handle single result response
            if (responseData instanceof Map<String, Object>) {
                Map<String, Object> singleResult = (Map<String, Object>) responseData;
                if (isValidBusinessEntity(singleResult)) {
                    resultData.results.add(singleResult);
                    resultData.totalCount = 1;
                }
            }
            // Handle array response
            else if (responseData instanceof List<Object>) {
                List<Object> tempList = (List<Object>) responseData;
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> businessEntity = (Map<String, Object>) item;
                        if (isValidBusinessEntity(businessEntity)) {
                            resultData.results.add(businessEntity);
                        }
                    }
                }
                resultData.totalCount = resultData.results.size();
            }
            
            // For demo purposes, create multiple results if we only have one
            if (resultData.results.size() == 1 && searchTerm.toLowerCase().contains('coles')) {
                createDemoResults(resultData);
            }
            
        } catch (Exception e) {
            System.debug('Error processing search results: ' + e.getMessage());
            throw new AuraHandledException('Error processing search results');
        }
        
        return resultData;
    }
    
    private static Boolean isValidBusinessEntity(Map<String, Object> entity) {
        return entity != null && 
               (entity.containsKey('abn') || entity.containsKey('entity_status') || entity.containsKey('other_trading_name'));
    }
    
    private static void createDemoResults(SearchResultData resultData) {
        // Create additional demo results based on the first result for demonstration
        if (!resultData.results.isEmpty()) {
            Map<String, Object> baseResult = resultData.results[0];
            
            // Create 5 additional similar results for demo
            for (Integer i = 2; i <= 6; i++) {
                Map<String, Object> demoResult = baseResult.deepClone();
                resultData.results.add(demoResult);
            }
            
            resultData.totalCount = resultData.results.size();
        }
    }
    
    // Response wrapper classes
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
    }
    
    public class SearchResultData {
        @AuraEnabled public List<Map<String, Object>> results;
        @AuraEnabled public Integer totalCount;
        @AuraEnabled public Integer currentPage;
        @AuraEnabled public Integer pageSize;
        
        public SearchResultData() {
            this.results = new List<Map<String, Object>>();
            this.totalCount = 0;
            this.currentPage = 1;
            this.pageSize = 10;
        }
    }
    
    // Test method for the controller
    @TestVisible
    private static void testApiConnection() {
        try {
            HttpResponse response = makeApiCallout(API_ENDPOINT + '?name=test');
            System.debug('Test API Response Status: ' + response.getStatusCode());
            System.debug('Test API Response Body: ' + response.getBody());
        } catch (Exception e) {
            System.debug('Test API Connection Error: ' + e.getMessage());
        }
    }
}
