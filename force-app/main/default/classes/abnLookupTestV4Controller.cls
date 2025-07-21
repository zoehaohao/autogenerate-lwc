public with sharing class abnLookupTestV4Controller {
    
    private static final String API_ENDPOINT = 'https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term cannot be empty', null);
            }
            
            // Sanitize input
            String sanitizedTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Make HTTP callout
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameter
            String endpoint = API_ENDPOINT + '?search=' + EncodingUtil.urlEncode(sanitizedTerm, 'UTF-8');
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                // Safe JSON parsing
                Object tempResult = JSON.deserializeUntyped(response.getBody());
                List<Object> tempList = (List<Object>) tempResult;
                List<Map<String, Object>> searchResults = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    Map<String, Object> resultItem = (Map<String, Object>) item;
                    searchResults.add(resultItem);
                }
                
                // Process and validate results
                List<ABNSearchResult> processedResults = processSearchResults(searchResults);
                
                return new ResponseWrapper(true, 'Search completed successfully', processedResults);
                
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
    
    private static List<ABNSearchResult> processSearchResults(List<Map<String, Object>> rawResults) {
        List<ABNSearchResult> processedResults = new List<ABNSearchResult>();
        
        for (Map<String, Object> rawResult : rawResults) {
            try {
                ABNSearchResult result = new ABNSearchResult();
                
                // Safe field extraction with null checks
                result.id = rawResult.containsKey('id') ? String.valueOf(rawResult.get('id')) : '';
                result.ABN = rawResult.containsKey('ABN') ? String.valueOf(rawResult.get('ABN')) : '';
                result.ABNStatus = rawResult.containsKey('ABNStatus') ? String.valueOf(rawResult.get('ABNStatus')) : '';
                result.EntityType = rawResult.containsKey('EntityType') ? String.valueOf(rawResult.get('EntityType')) : '';
                result.EntityName = rawResult.containsKey('EntityName') ? String.valueOf(rawResult.get('EntityName')) : '';
                result.GoodsServicesGST = rawResult.containsKey('GoodsServicesGST') ? String.valueOf(rawResult.get('GoodsServicesGST')) : '';
                result.MainBusinessLocation = rawResult.containsKey('MainBusinessLocation') ? String.valueOf(rawResult.get('MainBusinessLocation')) : '';
                
                // Validate required fields
                if (String.isNotBlank(result.ABN) && String.isNotBlank(result.EntityName)) {
                    processedResults.add(result);
                }
                
            } catch (Exception e) {
                System.debug('Error processing individual result: ' + e.getMessage());
                // Continue processing other results
                continue;
            }
        }
        
        return processedResults;
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
    
    // ABN Search Result class
    public class ABNSearchResult {
        @AuraEnabled public String id;
        @AuraEnabled public String ABN;
        @AuraEnabled public String ABNStatus;
        @AuraEnabled public String EntityType;
        @AuraEnabled public String EntityName;
        @AuraEnabled public String GoodsServicesGST;
        @AuraEnabled public String MainBusinessLocation;
        
        public ABNSearchResult() {
            // Default constructor
        }
    }
}
