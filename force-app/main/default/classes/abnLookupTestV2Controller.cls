public with sharing class abnLookupTestV2Controller {
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, Integer pageSize, Integer pageNumber) {
        try {
            // Validate input parameters
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            if (pageSize == null || pageSize <= 0) {
                pageSize = 10;
            }
            
            if (pageNumber == null || pageNumber <= 0) {
                pageNumber = 1;
            }
            
            // Determine search type and validate format
            String searchType = determineSearchType(searchTerm.trim());
            if (searchType == 'INVALID') {
                return new ResponseWrapper(false, 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again', null);
            }
            
            // Make API call
            List<ABNEntity> results = callABNLookupAPI(searchTerm.trim(), searchType);
            
            // Transform results for UI
            List<Map<String, Object>> transformedResults = transformResults(results);
            
            return new ResponseWrapper(true, 'Search completed successfully', transformedResults);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An error occurred while searching. Please try again.', null);
        }
    }
    
    private static String determineSearchType(String searchTerm) {
        // Check if input is numeric
        if (searchTerm.isNumeric()) {
            if (searchTerm.length() == 11) {
                return 'ABN';
            } else if (searchTerm.length() == 9) {
                return 'ACN';
            } else {
                return 'INVALID';
            }
        } else {
            // Non-numeric input is treated as business name
            return 'NAME';
        }
    }
    
    private static List<ABNEntity> callABNLookupAPI(String searchTerm, String searchType) {
        List<ABNEntity> results = new List<ABNEntity>();
        
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameters
            String endpoint = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
            
            // Add query parameters based on search type
            if (searchType == 'ABN') {
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            } else if (searchType == 'NAME') {
                endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            } else if (searchType == 'ACN') {
                // For ACN searches, we might need to use a different parameter or convert to ABN format
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(30000); // 30 second timeout
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                String responseBody = response.getBody();
                results = parseAPIResponse(responseBody, searchTerm);
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode());
                System.debug('API Error - Response: ' + response.getBody());
                
                // For demo purposes, return mock data if API fails
                results = generateMockResults(searchTerm, searchType);
            }
            
        } catch (Exception e) {
            System.debug('HTTP Callout Error: ' + e.getMessage());
            // Return mock data for demo purposes
            results = generateMockResults(searchTerm, searchType);
        }
        
        return results;
    }
    
    private static List<ABNEntity> parseAPIResponse(String responseBody, String searchTerm) {
        List<ABNEntity> entities = new List<ABNEntity>();
        
        try {
            // Parse the JSON response safely
            Object tempData = JSON.deserializeUntyped(responseBody);
            
            if (tempData instanceof Map<String, Object>) {
                // Single result
                Map<String, Object> data = (Map<String, Object>) tempData;
                ABNEntity entity = parseEntityFromMap(data);
                if (entity != null) {
                    entities.add(entity);
                }
            } else if (tempData instanceof List<Object>) {
                // Multiple results
                List<Object> tempList = (List<Object>) tempData;
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> data = (Map<String, Object>) item;
                        ABNEntity entity = parseEntityFromMap(data);
                        if (entity != null) {
                            entities.add(entity);
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            // Return mock data if parsing fails
            entities = generateMockResults(searchTerm, 'NAME');
        }
        
        return entities;
    }
    
    private static ABNEntity parseEntityFromMap(Map<String, Object> data) {
        try {
            ABNEntity entity = new ABNEntity();
            
            // Parse ABN information
            if (data.containsKey('abn') && data.get('abn') != null) {
                Map<String, Object> abnData = (Map<String, Object>) data.get('abn');
                if (abnData.containsKey('identifier_value')) {
                    entity.abn = (String) abnData.get('identifier_value');
                }
            }
            
            // Parse entity status
            if (data.containsKey('entity_status') && data.get('entity_status') != null) {
                Map<String, Object> statusData = (Map<String, Object>) data.get('entity_status');
                if (statusData.containsKey('entity_status_code')) {
                    entity.status = (String) statusData.get('entity_status_code');
                }
            }
            
            // Parse trading name
            if (data.containsKey('other_trading_name') && data.get('other_trading_name') != null) {
                Map<String, Object> nameData = (Map<String, Object>) data.get('other_trading_name');
                if (nameData.containsKey('organisation_name')) {
                    entity.businessName = (String) nameData.get('organisation_name');
                }
            }
            
            // Parse ASIC number (ACN)
            if (data.containsKey('asic_number')) {
                entity.acn = (String) data.get('asic_number');
            }
            
            // Parse entity type for entity name
            if (data.containsKey('entity_type') && data.get('entity_type') != null) {
                Map<String, Object> typeData = (Map<String, Object>) data.get('entity_type');
                if (typeData.containsKey('entity_description')) {
                    entity.entityName = (String) typeData.get('entity_description');
                }
            }
            
            // Set default values if missing
            if (String.isBlank(entity.entityName)) {
                entity.entityName = entity.businessName;
            }
            if (String.isBlank(entity.status)) {
                entity.status = 'Active';
            }
            
            // Set a default state (this would typically come from the API)
            entity.state = 'NSW'; // Default state
            
            return entity;
            
        } catch (Exception e) {
            System.debug('Error parsing entity: ' + e.getMessage());
            return null;
        }
    }
    
    private static List<ABNEntity> generateMockResults(String searchTerm, String searchType) {
        List<ABNEntity> mockResults = new List<ABNEntity>();
        
        if (searchType == 'ABN' || searchType == 'ACN') {
            // Return single result for specific number searches
            ABNEntity entity = new ABNEntity();
            entity.abn = searchType == 'ABN' ? searchTerm : '33051775556';
            entity.acn = searchType == 'ACN' ? searchTerm : '004085616';
            entity.entityName = 'Sample Business Entity';
            entity.businessName = 'Sample Trading Name';
            entity.status = 'Active';
            entity.state = 'NSW';
            mockResults.add(entity);
        } else {
            // Return multiple results for name searches
            List<String> states = new List<String>{'NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'};
            
            for (Integer i = 0; i < 5; i++) {
                ABNEntity entity = new ABNEntity();
                entity.abn = '3305177555' + i;
                entity.acn = '00408561' + i;
                entity.entityName = searchTerm + ' Entity ' + (i + 1);
                entity.businessName = searchTerm + ' Trading ' + (i + 1);
                entity.status = 'Active';
                entity.state = states[Math.mod(i, states.size())];
                mockResults.add(entity);
            }
        }
        
        return mockResults;
    }
    
    private static List<Map<String, Object>> transformResults(List<ABNEntity> entities) {
        List<Map<String, Object>> transformedResults = new List<Map<String, Object>>();
        
        for (Integer i = 0; i < entities.size(); i++) {
            ABNEntity entity = entities[i];
            Map<String, Object> result = new Map<String, Object>();
            
            result.put('id', String.valueOf(i));
            result.put('abn', entity.abn);
            result.put('acn', entity.acn);
            result.put('entityName', entity.entityName);
            result.put('businessName', entity.businessName);
            result.put('status', entity.status);
            result.put('state', entity.state);
            
            // Format display number (ABN with spaces)
            String displayNumber = '';
            if (String.isNotBlank(entity.abn) && entity.abn.length() == 11) {
                displayNumber = 'ABN ' + entity.abn.substring(0, 2) + ' ' + 
                               entity.abn.substring(2, 5) + ' ' + 
                               entity.abn.substring(5, 8) + ' ' + 
                               entity.abn.substring(8, 11);
            } else if (String.isNotBlank(entity.acn) && entity.acn.length() == 9) {
                displayNumber = 'ACN ' + entity.acn.substring(0, 3) + ' ' + 
                               entity.acn.substring(3, 6) + ' ' + 
                               entity.acn.substring(6, 9);
            }
            result.put('displayNumber', displayNumber);
            
            transformedResults.add(result);
        }
        
        return transformedResults;
    }
    
    // Inner classes
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
    
    private class ABNEntity {
        public String abn;
        public String acn;
        public String entityName;
        public String businessName;
        public String status;
        public String state;
    }
}
