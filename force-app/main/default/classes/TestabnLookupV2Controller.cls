public with sharing class TestabnLookupV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, String searchType, Integer pageNumber, Integer pageSize) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Sanitize input
            searchTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Validate search type and format
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search format for the specified search type', null);
            }
            
            // Make API call
            String apiResponse = callABNAPI(searchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response received from ABN service', null);
            }
            
            // Parse and process response
            SearchResultData resultData = parseAPIResponse(apiResponse, pageNumber, pageSize);
            
            return new ResponseWrapper(true, 'Search completed successfully', resultData);
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
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
    
    private static String callABNAPI(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        Map<String, String> queryParams = new Map<String, String>();
        
        switch on searchType {
            when 'abn' {
                queryParams.put('abn', searchTerm);
            }
            when 'acn' {
                queryParams.put('acn', searchTerm);
            }
            when 'name' {
                queryParams.put('name', EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            }
        }
        
        // Add query parameters to endpoint
        if (!queryParams.isEmpty()) {
            List<String> paramList = new List<String>();
            for (String key : queryParams.keySet()) {
                paramList.add(key + '=' + queryParams.get(key));
            }
            endpoint += '?' + String.join(paramList, '&');
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            return '{"results": []}'; // Return empty results for 404
        } else {
            throw new CalloutException('HTTP ' + response.getStatusCode() + ': ' + response.getStatus());
        }
    }
    
    private static SearchResultData parseAPIResponse(String jsonResponse, Integer pageNumber, Integer pageSize) {
        try {
            Object tempResponse = JSON.deserializeUntyped(jsonResponse);
            
            if (tempResponse == null) {
                return new SearchResultData();
            }
            
            // Handle single result response
            if (tempResponse instanceof Map<String, Object>) {
                Map<String, Object> singleResult = (Map<String, Object>) tempResponse;
                if (singleResult.containsKey('abn') || singleResult.containsKey('entity_status')) {
                    SearchResultData resultData = new SearchResultData();
                    resultData.results = new List<Map<String, Object>>{singleResult};
                    resultData.totalRecords = 1;
                    return resultData;
                }
            }
            
            // Handle array response
            if (tempResponse instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResponse;
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        results.add((Map<String, Object>) item);
                    }
                }
                
                SearchResultData resultData = new SearchResultData();
                resultData.results = results;
                resultData.totalRecords = results.size();
                return resultData;
            }
            
            // Handle wrapped response with results array
            if (tempResponse instanceof Map<String, Object>) {
                Map<String, Object> responseMap = (Map<String, Object>) tempResponse;
                if (responseMap.containsKey('results')) {
                    Object resultsObj = responseMap.get('results');
                    if (resultsObj instanceof List<Object>) {
                        List<Object> tempList = (List<Object>) resultsObj;
                        List<Map<String, Object>> results = new List<Map<String, Object>>();
                        
                        for (Object item : tempList) {
                            if (item instanceof Map<String, Object>) {
                                results.add((Map<String, Object>) item);
                            }
                        }
                        
                        SearchResultData resultData = new SearchResultData();
                        resultData.results = results;
                        resultData.totalRecords = results.size();
                        return resultData;
                    }
                }
            }
            
            return new SearchResultData();
            
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            throw new AuraHandledException('Unable to process search results');
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
    }
    
    // Search result data structure
    public class SearchResultData {
        @AuraEnabled public List<Map<String, Object>> results;
        @AuraEnabled public Integer totalRecords;
        
        public SearchResultData() {
            this.results = new List<Map<String, Object>>();
            this.totalRecords = 0;
        }
    }
}
