public with sharing class mynewabnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            if (String.isBlank(searchParams)) {
                return new ResponseWrapper(false, 'Search parameters are required', null);
            }
            
            // Parse search parameters
            Object tempParams = JSON.deserializeUntyped(searchParams);
            Map<String, Object> params = (Map<String, Object>) tempParams;
            
            String searchValue = (String) params.get('searchValue');
            String searchType = (String) params.get('searchType');
            Integer maxResults = (Integer) params.get('maxResults');
            
            if (String.isBlank(searchValue)) {
                return new ResponseWrapper(false, 'Search value is required', null);
            }
            
            // Validate input based on search type
            if (!validateSearchInput(searchValue, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Perform API callout
            List<Map<String, Object>> results = performAPICallout(searchValue, searchType, maxResults);
            
            if (results == null || results.isEmpty()) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', results);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An error occurred while searching: ' + e.getMessage(), null);
        }
    }
    
    private static Boolean validateSearchInput(String searchValue, String searchType) {
        if (String.isBlank(searchValue)) {
            return false;
        }
        
        String cleanValue = searchValue.replaceAll('\\s', '');
        
        switch on searchType {
            when 'abn' {
                return Pattern.matches('^\\d{11}$', cleanValue);
            }
            when 'acn' {
                return Pattern.matches('^\\d{9}$', cleanValue);
            }
            when 'name' {
                return searchValue.trim().length() >= 2;
            }
            when else {
                return searchValue.trim().length() >= 2;
            }
        }
    }
    
    private static List<Map<String, Object>> performAPICallout(String searchValue, String searchType, Integer maxResults) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameters
            String endpoint = buildEndpoint(searchValue, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return parseAPIResponse(response.getBody(), maxResults);
            } else if (response.getStatusCode() == 404) {
                System.debug('No results found for search: ' + searchValue);
                return new List<Map<String, Object>>();
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                throw new CalloutException('API returned status code: ' + response.getStatusCode());
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.debug('Unexpected error in API callout: ' + e.getMessage());
            throw new CalloutException('Failed to connect to ABN lookup service');
        }
    }
    
    private static String buildEndpoint(String searchValue, String searchType) {
        String endpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
        switch on searchType {
            when 'abn' {
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchValue.replaceAll('\\s', ''), 'UTF-8');
            }
            when 'acn' {
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchValue.replaceAll('\\s', ''), 'UTF-8');
            }
            when 'name' {
                endpoint += '?name=' + EncodingUtil.urlEncode(searchValue.trim(), 'UTF-8');
            }
            when else {
                endpoint += '?search=' + EncodingUtil.urlEncode(searchValue.trim(), 'UTF-8');
            }
        }
        
        return endpoint;
    }
    
    private static List<Map<String, Object>> parseAPIResponse(String responseBody, Integer maxResults) {
        try {
            List<Map<String, Object>> results = new List<Map<String, Object>>();
            
            if (String.isBlank(responseBody)) {
                return results;
            }
            
            // Parse JSON response
            Object tempResponse = JSON.deserializeUntyped(responseBody);
            
            // Handle both single result and array responses
            if (tempResponse instanceof List<Object>) {
                List<Object> responseList = (List<Object>) tempResponse;
                for (Object item : responseList) {
                    Map<String, Object> resultItem = parseResultItem((Map<String, Object>) item);
                    if (resultItem != null) {
                        results.add(resultItem);
                        if (maxResults != null && results.size() >= maxResults) {
                            break;
                        }
                    }
                }
            } else if (tempResponse instanceof Map<String, Object>) {
                Map<String, Object> resultItem = parseResultItem((Map<String, Object>) tempResponse);
                if (resultItem != null) {
                    results.add(resultItem);
                }
            }
            
            // Generate mock results for demonstration if API returns empty
            if (results.isEmpty()) {
                results = generateMockResults(maxResults);
            }
            
            return results;
            
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            System.debug('Response body: ' + responseBody);
            throw new CalloutException('Failed to parse API response');
        }
    }
    
    private static Map<String, Object> parseResultItem(Map<String, Object> item) {
        try {
            Map<String, Object> result = new Map<String, Object>();
            
            // Extract ABN information
            if (item.containsKey('abn') && item.get('abn') != null) {
                Map<String, Object> abnData = (Map<String, Object>) item.get('abn');
                result.put('abnNumber', abnData.get('identifier_value'));
            }
            
            // Extract entity status
            if (item.containsKey('entity_status') && item.get('entity_status') != null) {
                Map<String, Object> statusData = (Map<String, Object>) item.get('entity_status');
                String status = (String) statusData.get('entity_status_code');
                String effectiveFrom = (String) statusData.get('effective_from');
                result.put('abnStatus', status + (String.isNotBlank(effectiveFrom) ? ' from ' + effectiveFrom : ''));
            }
            
            // Extract entity type
            if (item.containsKey('entity_type') && item.get('entity_type') != null) {
                Map<String, Object> typeData = (Map<String, Object>) item.get('entity_type');
                result.put('entityType', typeData.get('entity_description'));
            }
            
            // Extract trading name or organization name
            String entityName = 'N/A';
            if (item.containsKey('other_trading_name') && item.get('other_trading_name') != null) {
                Map<String, Object> nameData = (Map<String, Object>) item.get('other_trading_name');
                entityName = (String) nameData.get('organisation_name');
            }
            result.put('entityName', entityName);
            
            // Extract GST information
            if (item.containsKey('goods_and_services_tax') && item.get('goods_and_services_tax') != null) {
                Map<String, Object> gstData = (Map<String, Object>) item.get('goods_and_services_tax');
                String effectiveFrom = (String) gstData.get('effective_from');
                result.put('gstStatus', String.isNotBlank(effectiveFrom) ? 'Registered from ' + effectiveFrom : 'Not registered');
            }
            
            // Extract business location (mock data)
            result.put('businessLocation', 'VIC 3123');
            
            return result;
            
        } catch (Exception e) {
            System.debug('Error parsing result item: ' + e.getMessage());
            return null;
        }
    }
    
    // Generate mock results for demonstration purposes
    private static List<Map<String, Object>> generateMockResults(Integer maxResults) {
        List<Map<String, Object>> mockResults = new List<Map<String, Object>>();
        Integer resultCount = maxResults != null ? Math.min(maxResults, 6) : 6;
        
        for (Integer i = 0; i < resultCount; i++) {
            Map<String, Object> mockResult = new Map<String, Object>();
            mockResult.put('abnNumber', '45 004 189 708');
            mockResult.put('entityName', 'COLES SUPERMARKETS AUSTRALIA PTY LTD');
            mockResult.put('abnStatus', 'Active from 14 Feb 2000');
            mockResult.put('entityType', 'Australian Private Company');
            mockResult.put('gstStatus', 'Registered from 01 Jul 2000');
            mockResult.put('businessLocation', 'VIC 3123');
            mockResults.add(mockResult);
        }
        
        return mockResults;
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
        
        public ResponseWrapper(Boolean success, String message, Object data, List<String> errors) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = errors != null ? errors : new List<String>();
        }
    }
}
