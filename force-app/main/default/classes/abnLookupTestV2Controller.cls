public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, Integer pageSize, Integer pageNumber) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            if (pageSize == null || pageSize <= 0) {
                pageSize = 10;
            }
            
            if (pageNumber == null || pageNumber <= 0) {
                pageNumber = 1;
            }
            
            // Determine search type and build parameters
            Map<String, String> queryParams = buildQueryParameters(searchTerm.trim());
            
            // Make API call
            HttpResponse response = makeAPICall(queryParams);
            
            if (response.getStatusCode() == 200) {
                // Parse response
                SearchResultData resultData = parseAPIResponse(response.getBody(), pageSize, pageNumber);
                return new ResponseWrapper(true, 'Search completed successfully', resultData);
            } else {
                System.debug('API Error - Status: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'External service error: ' + response.getStatus(), null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN lookup service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static Map<String, String> buildQueryParameters(String searchTerm) {
        Map<String, String> params = new Map<String, String>();
        
        // Remove spaces and check if numeric
        String cleanedTerm = searchTerm.replace(' ', '');
        
        if (Pattern.matches('^\\d+$', cleanedTerm)) {
            // Numeric search - determine if ABN or ACN
            if (cleanedTerm.length() == 11) {
                params.put('abn', cleanedTerm);
            } else if (cleanedTerm.length() == 9) {
                params.put('acn', cleanedTerm);
            } else {
                // Invalid numeric format - still search by name as fallback
                params.put('name', searchTerm);
            }
        } else {
            // Text search
            params.put('name', searchTerm);
        }
        
        return params;
    }
    
    private static HttpResponse makeAPICall(Map<String, String> queryParams) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build URL with query parameters
        String url = API_ENDPOINT;
        if (!queryParams.isEmpty()) {
            List<String> paramStrings = new List<String>();
            for (String key : queryParams.keySet()) {
                paramStrings.add(key + '=' + EncodingUtil.urlEncode(queryParams.get(key), 'UTF-8'));
            }
            url += '?' + String.join(paramStrings, '&');
        }
        
        request.setEndpoint(url);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        return http.send(request);
    }
    
    private static SearchResultData parseAPIResponse(String responseBody, Integer pageSize, Integer pageNumber) {
        SearchResultData resultData = new SearchResultData();
        
        try {
            // Parse JSON response safely
            Object tempData = JSON.deserializeUntyped(responseBody);
            
            if (tempData instanceof List<Object>) {
                // Multiple results
                List<Object> tempList = (List<Object>) tempData;
                List<ABNEntity> entities = new List<ABNEntity>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> entityMap = (Map<String, Object>) item;
                        entities.add(parseEntityFromMap(entityMap));
                    }
                }
                
                resultData.results = entities;
                resultData.totalCount = entities.size();
                
            } else if (tempData instanceof Map<String, Object>) {
                // Single result
                Map<String, Object> entityMap = (Map<String, Object>) tempData;
                ABNEntity entity = parseEntityFromMap(entityMap);
                
                resultData.results = new List<ABNEntity>{ entity };
                resultData.totalCount = 1;
            }
            
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            // Return empty results on parsing error
            resultData.results = new List<ABNEntity>();
            resultData.totalCount = 0;
        }
        
        return resultData;
    }
    
    private static ABNEntity parseEntityFromMap(Map<String, Object> entityMap) {
        ABNEntity entity = new ABNEntity();
        
        try {
            // Parse ABN information
            if (entityMap.containsKey('abn') && entityMap.get('abn') != null) {
                Map<String, Object> abnMap = (Map<String, Object>) entityMap.get('abn');
                if (abnMap.containsKey('identifier_value')) {
                    entity.abn = String.valueOf(abnMap.get('identifier_value'));
                }
            }
            
            // Parse ASIC number (ACN)
            if (entityMap.containsKey('asic_number') && entityMap.get('asic_number') != null) {
                entity.acn = String.valueOf(entityMap.get('asic_number'));
            }
            
            // Parse entity status
            if (entityMap.containsKey('entity_status') && entityMap.get('entity_status') != null) {
                Map<String, Object> statusMap = (Map<String, Object>) entityMap.get('entity_status');
                if (statusMap.containsKey('entity_status_code')) {
                    entity.status = String.valueOf(statusMap.get('entity_status_code'));
                }
            }
            
            // Parse trading name
            if (entityMap.containsKey('other_trading_name') && entityMap.get('other_trading_name') != null) {
                Map<String, Object> tradingMap = (Map<String, Object>) entityMap.get('other_trading_name');
                if (tradingMap.containsKey('organisation_name')) {
                    entity.businessName = String.valueOf(tradingMap.get('organisation_name'));
                }
            }
            
            // Parse entity type
            if (entityMap.containsKey('entity_type') && entityMap.get('entity_type') != null) {
                Map<String, Object> typeMap = (Map<String, Object>) entityMap.get('entity_type');
                if (typeMap.containsKey('entity_description')) {
                    entity.entityType = String.valueOf(typeMap.get('entity_description'));
                    entity.entityName = entity.entityType; // Use as entity name if no other name available
                }
            }
            
            // Parse last updated date
            if (entityMap.containsKey('record_last_updated_date') && entityMap.get('record_last_updated_date') != null) {
                entity.lastUpdated = String.valueOf(entityMap.get('record_last_updated_date'));
            }
            
            // Set default values if not found
            if (String.isBlank(entity.entityName)) {
                entity.entityName = entity.businessName;
            }
            if (String.isBlank(entity.entityName)) {
                entity.entityName = 'Unknown Entity';
            }
            if (String.isBlank(entity.status)) {
                entity.status = 'Unknown';
            }
            
        } catch (Exception e) {
            System.debug('Entity parsing error: ' + e.getMessage());
            // Return entity with default values
            if (String.isBlank(entity.entityName)) {
                entity.entityName = 'Unknown Entity';
            }
            if (String.isBlank(entity.status)) {
                entity.status = 'Unknown';
            }
        }
        
        return entity;
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
        @AuraEnabled public List<ABNEntity> results;
        @AuraEnabled public Integer totalCount;
        
        public SearchResultData() {
            this.results = new List<ABNEntity>();
            this.totalCount = 0;
        }
    }
    
    // ABN Entity data structure
    public class ABNEntity {
        @AuraEnabled public String abn;
        @AuraEnabled public String acn;
        @AuraEnabled public String entityName;
        @AuraEnabled public String businessName;
        @AuraEnabled public String status;
        @AuraEnabled public String state;
        @AuraEnabled public String entityType;
        @AuraEnabled public String lastUpdated;
        
        public ABNEntity() {
            // Initialize with empty strings to avoid null values
            this.abn = '';
            this.acn = '';
            this.entityName = '';
            this.businessName = '';
            this.status = '';
            this.state = '';
            this.entityType = '';
            this.lastUpdated = '';
        }
    }
}
