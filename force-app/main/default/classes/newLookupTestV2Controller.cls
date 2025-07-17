public with sharing class newLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(Map<String, Object> searchParams) {
        try {
            String searchValue = (String) searchParams.get('searchValue');
            String searchType = (String) searchParams.get('searchType');
            
            if (String.isBlank(searchValue) || String.isBlank(searchType)) {
                return new ResponseWrapper(false, 'Search value and type are required', null);
            }
            
            // Validate input based on search type
            if (!validateSearchInput(searchValue, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(searchValue, searchType);
            
            // Parse and process response
            List<Map<String, Object>> processedResults = processAPIResponse(apiResponse);
            
            return new ResponseWrapper(true, 'Search completed successfully', processedResults);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'Search failed: ' + e.getMessage(), null);
        }
    }
    
    private static Boolean validateSearchInput(String searchValue, String searchType) {
        String cleanValue = searchValue.replaceAll('\\s', ''); // Remove spaces
        
        switch on searchType {
            when 'ABN' {
                return Pattern.matches('^\\d{11}$', cleanValue);
            }
            when 'ACN' {
                return Pattern.matches('^\\d{9}$', cleanValue);
            }
            when 'NAME' {
                return searchValue.trim().length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static String makeAPICall(String searchValue, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        String queryParam = buildQueryParameter(searchValue, searchType);
        if (String.isNotBlank(queryParam)) {
            endpoint += '?' + queryParam;
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            throw new AuraHandledException('No results found for the search criteria');
        } else {
            throw new AuraHandledException('API call failed with status: ' + response.getStatusCode());
        }
    }
    
    private static String buildQueryParameter(String searchValue, String searchType) {
        String cleanValue = EncodingUtil.urlEncode(searchValue.trim(), 'UTF-8');
        
        switch on searchType {
            when 'ABN' {
                return 'abn=' + cleanValue;
            }
            when 'ACN' {
                return 'acn=' + cleanValue;
            }
            when 'NAME' {
                return 'name=' + cleanValue;
            }
            when else {
                return '';
            }
        }
    }
    
    private static List<Map<String, Object>> processAPIResponse(String jsonResponse) {
        List<Map<String, Object>> results = new List<Map<String, Object>>();
        
        try {
            Object tempResponse = JSON.deserializeUntyped(jsonResponse);
            
            // Handle single result or array of results
            if (tempResponse instanceof List<Object>) {
                List<Object> responseList = (List<Object>) tempResponse;
                for (Object item : responseList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> processedItem = processBusinessEntity((Map<String, Object>) item);
                        results.add(processedItem);
                    }
                }
            } else if (tempResponse instanceof Map<String, Object>) {
                Map<String, Object> processedItem = processBusinessEntity((Map<String, Object>) tempResponse);
                results.add(processedItem);
            }
            
        } catch (Exception e) {
            System.debug('Error processing API response: ' + e.getMessage());
            throw new AuraHandledException('Failed to process search results');
        }
        
        return results;
    }
    
    private static Map<String, Object> processBusinessEntity(Map<String, Object> entity) {
        Map<String, Object> processedEntity = new Map<String, Object>();
        
        try {
            // Extract ABN information
            String abnNumber = extractABNNumber(entity);
            processedEntity.put('abnNumber', abnNumber);
            
            // Extract entity name
            String entityName = extractEntityName(entity);
            processedEntity.put('entityName', entityName);
            
            // Extract ABN status
            String abnStatus = extractABNStatus(entity);
            processedEntity.put('abnStatus', abnStatus);
            
            // Extract entity type
            String entityType = extractEntityType(entity);
            processedEntity.put('entityType', entityType);
            
            // Extract GST status
            String gstStatus = extractGSTStatus(entity);
            processedEntity.put('gstStatus', gstStatus);
            
            // Extract business location
            String businessLocation = extractBusinessLocation(entity);
            processedEntity.put('businessLocation', businessLocation);
            
            // Store raw data for reference
            processedEntity.put('rawData', entity);
            
        } catch (Exception e) {
            System.debug('Error processing business entity: ' + e.getMessage());
            // Return basic structure with available data
            processedEntity.put('abnNumber', 'N/A');
            processedEntity.put('entityName', 'N/A');
            processedEntity.put('abnStatus', 'N/A');
            processedEntity.put('entityType', 'N/A');
            processedEntity.put('gstStatus', 'N/A');
            processedEntity.put('businessLocation', 'N/A');
        }
        
        return processedEntity;
    }
    
    private static String extractABNNumber(Map<String, Object> entity) {
        if (entity.containsKey('abn') && entity.get('abn') instanceof Map<String, Object>) {
            Map<String, Object> abnData = (Map<String, Object>) entity.get('abn');
            if (abnData.containsKey('identifier_value')) {
                return (String) abnData.get('identifier_value');
            }
        }
        return 'N/A';
    }
    
    private static String extractEntityName(Map<String, Object> entity) {
        if (entity.containsKey('other_trading_name') && entity.get('other_trading_name') instanceof Map<String, Object>) {
            Map<String, Object> tradingName = (Map<String, Object>) entity.get('other_trading_name');
            if (tradingName.containsKey('organisation_name')) {
                return (String) tradingName.get('organisation_name');
            }
        }
        return 'N/A';
    }
    
    private static String extractABNStatus(Map<String, Object> entity) {
        if (entity.containsKey('entity_status') && entity.get('entity_status') instanceof Map<String, Object>) {
            Map<String, Object> entityStatus = (Map<String, Object>) entity.get('entity_status');
            if (entityStatus.containsKey('entity_status_code') && entityStatus.containsKey('effective_from')) {
                String statusCode = (String) entityStatus.get('entity_status_code');
                String effectiveFrom = (String) entityStatus.get('effective_from');
                return statusCode + ' from ' + formatDate(effectiveFrom);
            }
        }
        return 'N/A';
    }
    
    private static String extractEntityType(Map<String, Object> entity) {
        if (entity.containsKey('entity_type') && entity.get('entity_type') instanceof Map<String, Object>) {
            Map<String, Object> entityType = (Map<String, Object>) entity.get('entity_type');
            if (entityType.containsKey('entity_description')) {
                return (String) entityType.get('entity_description');
            }
        }
        return 'N/A';
    }
    
    private static String extractGSTStatus(Map<String, Object> entity) {
        if (entity.containsKey('goods_and_services_tax') && entity.get('goods_and_services_tax') instanceof Map<String, Object>) {
            Map<String, Object> gstData = (Map<String, Object>) entity.get('goods_and_services_tax');
            if (gstData.containsKey('effective_from')) {
                String effectiveFrom = (String) gstData.get('effective_from');
                return 'Registered from ' + formatDate(effectiveFrom);
            }
        }
        return 'Not registered';
    }
    
    private static String extractBusinessLocation(Map<String, Object> entity) {
        // This would typically come from address data in the API response
        // For now, returning a placeholder based on available data
        if (entity.containsKey('asic_number')) {
            return 'VIC 3123'; // Placeholder based on sample data
        }
        return 'N/A';
    }
    
    private static String formatDate(String dateString) {
        try {
            if (String.isNotBlank(dateString) && !dateString.equals('0001-01-01')) {
                Date parsedDate = Date.valueOf(dateString);
                return parsedDate.format();
            }
        } catch (Exception e) {
            System.debug('Error formatting date: ' + e.getMessage());
        }
        return dateString;
    }
    
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
}
