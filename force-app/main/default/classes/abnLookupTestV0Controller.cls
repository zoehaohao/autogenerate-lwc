public with sharing class abnLookupTestV0Controller {
    
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
            String sanitizedSearchTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Make HTTP callout
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameter
            String endpoint = API_ENDPOINT + '?search=' + EncodingUtil.urlEncode(sanitizedSearchTerm, 'UTF-8');
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                // Parse response safely
                List<ABNEntity> entities = parseABNResponse(response.getBody());
                
                if (entities != null && !entities.isEmpty()) {
                    return new ResponseWrapper(true, 'Search completed successfully', entities);
                } else {
                    return new ResponseWrapper(true, 'No results found', new List<ABNEntity>());
                }
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'Search service temporarily unavailable. Please try again later.', null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to search service. Please check your internet connection and try again.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static List<ABNEntity> parseABNResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return new List<ABNEntity>();
            }
            
            // Safe JSON parsing
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            if (tempResult == null) {
                return new List<ABNEntity>();
            }
            
            List<Object> tempList = (List<Object>) tempResult;
            List<ABNEntity> entities = new List<ABNEntity>();
            
            for (Object item : tempList) {
                if (item != null) {
                    Map<String, Object> entityMap = (Map<String, Object>) item;
                    ABNEntity entity = new ABNEntity();
                    
                    // Safe field extraction with null checks
                    entity.id = getString(entityMap, 'id');
                    entity.ABN = getLong(entityMap, 'ABN');
                    entity.ABNStatus = getString(entityMap, 'ABNStatus');
                    entity.EntityType = getString(entityMap, 'EntityType');
                    entity.EntityName = getString(entityMap, 'EntityName');
                    entity.GoodsServicesGST = getString(entityMap, 'GoodsServicesGST');
                    entity.MainBusinessLocation = getString(entityMap, 'MainBusinessLocation');
                    
                    entities.add(entity);
                }
            }
            
            return entities;
            
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            return new List<ABNEntity>();
        }
    }
    
    private static String getString(Map<String, Object> dataMap, String fieldName) {
        if (dataMap != null && dataMap.containsKey(fieldName) && dataMap.get(fieldName) != null) {
            return String.valueOf(dataMap.get(fieldName));
        }
        return '';
    }
    
    private static Long getLong(Map<String, Object> dataMap, String fieldName) {
        if (dataMap != null && dataMap.containsKey(fieldName) && dataMap.get(fieldName) != null) {
            Object value = dataMap.get(fieldName);
            if (value instanceof Long) {
                return (Long) value;
            } else if (value instanceof Integer) {
                return Long.valueOf((Integer) value);
            } else if (value instanceof String) {
                try {
                    return Long.valueOf((String) value);
                } catch (NumberFormatException e) {
                    System.debug('Number format error for field ' + fieldName + ': ' + value);
                    return 0;
                }
            }
        }
        return 0;
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
        @AuraEnabled public Long ABN;
        @AuraEnabled public String ABNStatus;
        @AuraEnabled public String EntityType;
        @AuraEnabled public String EntityName;
        @AuraEnabled public String GoodsServicesGST;
        @AuraEnabled public String MainBusinessLocation;
        
        public ABNEntity() {
            this.id = '';
            this.ABN = 0;
            this.ABNStatus = '';
            this.EntityType = '';
            this.EntityName = '';
            this.GoodsServicesGST = '';
            this.MainBusinessLocation = '';
        }
    }
}
