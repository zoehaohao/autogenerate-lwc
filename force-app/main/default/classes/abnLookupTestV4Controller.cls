public with sharing class abnLookupTestV4Controller {
    
    private static final String API_ENDPOINT = 'https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
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
                // Parse response safely
                List<Map<String, Object>> results = parseSearchResults(response.getBody());
                
                // Process and validate results
                List<ABNEntity> entities = processSearchResults(results);
                
                return new ResponseWrapper(true, 'Search completed successfully', entities);
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'Search service temporarily unavailable. Please try again later.', null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to search service. Please check your connection and try again.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static List<Map<String, Object>> parseSearchResults(String jsonResponse) {
        try {
            // Safe JSON parsing
            Object tempResult = JSON.deserializeUntyped(jsonResponse);
            
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        results.add((Map<String, Object>) item);
                    }
                }
                
                return results;
            } else {
                System.debug('Unexpected JSON structure: ' + jsonResponse);
                return new List<Map<String, Object>>();
            }
            
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            return new List<Map<String, Object>>();
        }
    }
    
    private static List<ABNEntity> processSearchResults(List<Map<String, Object>> rawResults) {
        List<ABNEntity> entities = new List<ABNEntity>();
        
        for (Map<String, Object> result : rawResults) {
            try {
                ABNEntity entity = new ABNEntity();
                
                // Safely extract and validate data
                entity.id = getStringValue(result, 'id');
                entity.ABN = getStringValue(result, 'ABN');
                entity.ABNStatus = getStringValue(result, 'ABNStatus');
                entity.EntityType = getStringValue(result, 'EntityType');
                entity.EntityName = getStringValue(result, 'EntityName');
                entity.GoodsServicesGST = getStringValue(result, 'GoodsServicesGST');
                entity.MainBusinessLocation = getStringValue(result, 'MainBusinessLocation');
                
                // Validate required fields
                if (String.isNotBlank(entity.id) && String.isNotBlank(entity.EntityName)) {
                    entities.add(entity);
                }
                
            } catch (Exception e) {
                System.debug('Error processing result: ' + e.getMessage());
                // Continue processing other results
            }
        }
        
        return entities;
    }
    
    private static String getStringValue(Map<String, Object> data, String key) {
        if (data != null && data.containsKey(key) && data.get(key) != null) {
            return String.valueOf(data.get(key));
        }
        return '';
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
    
    // ABN Entity class
    public class ABNEntity {
        @AuraEnabled public String id;
        @AuraEnabled public String ABN;
        @AuraEnabled public String ABNStatus;
        @AuraEnabled public String EntityType;
        @AuraEnabled public String EntityName;
        @AuraEnabled public String GoodsServicesGST;
        @AuraEnabled public String MainBusinessLocation;
        
        public ABNEntity() {
            // Default constructor
        }
    }
}
