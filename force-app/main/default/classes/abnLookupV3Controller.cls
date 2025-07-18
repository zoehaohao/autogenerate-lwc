public with sharing class abnLookupV3Controller {
    
    private static final String API_ENDPOINT = 'https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, Integer pageSize, Integer pageNumber) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Sanitize input
            String sanitizedTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Make HTTP callout
            HttpResponse response = makeAPICallout(sanitizedTerm);
            
            if (response.getStatusCode() == 200) {
                // Parse response safely
                List<Map<String, Object>> searchResults = parseAPIResponse(response.getBody());
                
                // Apply pagination if needed
                List<Map<String, Object>> paginatedResults = applyPagination(searchResults, pageSize, pageNumber);
                
                return new ResponseWrapper(true, 'Search completed successfully', paginatedResults, searchResults.size());
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'External service error: ' + response.getStatus(), null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Network error occurred. Please check your connection and try again.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static HttpResponse makeAPICallout(String searchTerm) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameter
        String endpoint = API_ENDPOINT + '?search=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        return http.send(request);
    }
    
    private static List<Map<String, Object>> parseAPIResponse(String responseBody) {
        List<Map<String, Object>> results = new List<Map<String, Object>>();
        
        try {
            // Safe JSON parsing
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> resultItem = (Map<String, Object>) item;
                        
                        // Validate and sanitize each result item
                        Map<String, Object> sanitizedItem = sanitizeResultItem(resultItem);
                        if (sanitizedItem != null) {
                            results.add(sanitizedItem);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            throw new AuraHandledException('Failed to parse search results');
        }
        
        return results;
    }
    
    private static Map<String, Object> sanitizeResultItem(Map<String, Object> item) {
        try {
            Map<String, Object> sanitized = new Map<String, Object>();
            
            // Required fields with safe extraction
            sanitized.put('id', getStringSafely(item, 'id'));
            sanitized.put('ABN', getStringSafely(item, 'ABN'));
            sanitized.put('EntityName', getStringSafely(item, 'EntityName'));
            sanitized.put('ABNStatus', getStringSafely(item, 'ABNStatus'));
            sanitized.put('EntityType', getStringSafely(item, 'EntityType'));
            sanitized.put('GoodsServicesGST', getStringSafely(item, 'GoodsServicesGST'));
            sanitized.put('MainBusinessLocation', getStringSafely(item, 'MainBusinessLocation'));
            
            return sanitized;
        } catch (Exception e) {
            System.debug('Error sanitizing result item: ' + e.getMessage());
            return null;
        }
    }
    
    private static String getStringSafely(Map<String, Object> item, String key) {
        Object value = item.get(key);
        return value != null ? String.valueOf(value) : '';
    }
    
    private static List<Map<String, Object>> applyPagination(List<Map<String, Object>> results, Integer pageSize, Integer pageNumber) {
        if (results == null || results.isEmpty()) {
            return new List<Map<String, Object>>();
        }
        
        // Default pagination values
        Integer actualPageSize = pageSize != null && pageSize > 0 ? pageSize : 10;
        Integer actualPageNumber = pageNumber != null && pageNumber > 0 ? pageNumber : 1;
        
        Integer startIndex = (actualPageNumber - 1) * actualPageSize;
        Integer endIndex = Math.min(startIndex + actualPageSize, results.size());
        
        if (startIndex >= results.size()) {
            return new List<Map<String, Object>>();
        }
        
        List<Map<String, Object>> paginatedResults = new List<Map<String, Object>>();
        for (Integer i = startIndex; i < endIndex; i++) {
            paginatedResults.add(results[i]);
        }
        
        return paginatedResults;
    }
    
    // Response wrapper class
    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Object data;
        @AuraEnabled public Integer totalCount;
        @AuraEnabled public List<String> errors;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.totalCount = 0;
            this.errors = new List<String>();
        }
        
        public ResponseWrapper(Boolean success, String message, Object data, Integer totalCount) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.totalCount = totalCount;
            this.errors = new List<String>();
        }
    }
}
