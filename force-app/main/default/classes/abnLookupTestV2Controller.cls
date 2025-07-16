public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchAbnEntities(String searchTerm, Integer pageSize, Integer pageNumber) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Sanitize inputs
            String cleanSearchTerm = searchTerm.trim();
            Integer cleanPageSize = (pageSize != null && pageSize > 0) ? pageSize : 10;
            Integer cleanPageNumber = (pageNumber != null && pageNumber > 0) ? pageNumber : 1;
            
            // Validate search term format
            ValidationResult validation = validateSearchTerm(cleanSearchTerm);
            if (!validation.isValid) {
                return new ResponseWrapper(false, validation.errorMessage, null);
            }
            
            // Make API call
            HttpResponse response = makeApiCall(cleanSearchTerm);
            
            if (response.getStatusCode() == 200) {
                // Parse response safely
                SearchResultData resultData = parseApiResponse(response.getBody(), cleanPageSize, cleanPageNumber);
                return new ResponseWrapper(true, 'Search completed successfully', resultData);
            } else {
                String errorMsg = 'API call failed with status: ' + response.getStatusCode();
                System.debug('ABN API Error: ' + errorMsg + ' - Body: ' + response.getBody());
                return new ResponseWrapper(false, 'No matching results found', null);
            }
            
        } catch (CalloutException e) {
            System.debug('ABN API Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Service temporarily unavailable. Please try again later.', null);
        } catch (Exception e) {
            System.debug('ABN Search Exception: ' + e.getMessage() + ' - Stack: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static ValidationResult validateSearchTerm(String searchTerm) {
        ValidationResult result = new ValidationResult();
        
        if (String.isBlank(searchTerm)) {
            result.isValid = false;
            result.errorMessage = 'Search term cannot be empty';
            return result;
        }
        
        // Check if numeric (ABN/ACN)
        if (Pattern.matches('^\\d+$', searchTerm)) {
            if (searchTerm.length() == 11) {
                // Valid ABN
                result.isValid = true;
                result.searchType = 'ABN';
            } else if (searchTerm.length() == 9) {
                // Valid ACN
                result.isValid = true;
                result.searchType = 'ACN';
            } else {
                result.isValid = false;
                result.errorMessage = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
            }
        } else {
            // Business name search
            if (searchTerm.length() < 2) {
                result.isValid = false;
                result.errorMessage = 'Business name must be at least 2 characters';
            } else {
                result.isValid = true;
                result.searchType = 'NAME';
            }
        }
        
        return result;
    }
    
    private static HttpResponse makeApiCall(String searchTerm) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        
        // Determine parameter based on search term type
        if (Pattern.matches('^\\d{11}$', searchTerm)) {
            endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        } else if (Pattern.matches('^\\d{9}$', searchTerm)) {
            endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        } else {
            endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        System.debug('ABN API Request: ' + endpoint);
        
        return http.send(request);
    }
    
    private static SearchResultData parseApiResponse(String responseBody, Integer pageSize, Integer pageNumber) {
        SearchResultData resultData = new SearchResultData();
        
        try {
            // Parse JSON response safely
            Object tempResponse = JSON.deserializeUntyped(responseBody);
            
            if (tempResponse instanceof Map<String, Object>) {
                // Single result
                Map<String, Object> singleResult = (Map<String, Object>) tempResponse;
                resultData.results = new List<Object>{ singleResult };
                resultData.totalCount = 1;
            } else if (tempResponse instanceof List<Object>) {
                // Multiple results
                List<Object> tempList = (List<Object>) tempResponse;
                List<Object> results = new List<Object>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        results.add((Map<String, Object>) item);
                    }
                }
                
                resultData.results = results;
                resultData.totalCount = results.size();
            } else {
                // Unexpected format - create empty result
                resultData.results = new List<Object>();
                resultData.totalCount = 0;
            }
            
            // Apply pagination
            if (resultData.results != null && resultData.results.size() > 0) {
                Integer startIndex = (pageNumber - 1) * pageSize;
                Integer endIndex = Math.min(startIndex + pageSize, resultData.results.size());
                
                if (startIndex < resultData.results.size()) {
                    List<Object> paginatedResults = new List<Object>();
                    for (Integer i = startIndex; i < endIndex; i++) {
                        paginatedResults.add(resultData.results[i]);
                    }
                    resultData.results = paginatedResults;
                }
            }
            
        } catch (JSONException e) {
            System.debug('JSON Parse Error: ' + e.getMessage());
            resultData.results = new List<Object>();
            resultData.totalCount = 0;
        }
        
        return resultData;
    }
    
    // Wrapper classes
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
        @AuraEnabled public List<Object> results;
        @AuraEnabled public Integer totalCount;
        @AuraEnabled public Integer currentPage;
        @AuraEnabled public Integer pageSize;
        
        public SearchResultData() {
            this.results = new List<Object>();
            this.totalCount = 0;
            this.currentPage = 1;
            this.pageSize = 10;
        }
    }
    
    private class ValidationResult {
        public Boolean isValid = false;
        public String errorMessage = '';
        public String searchType = '';
    }
}
