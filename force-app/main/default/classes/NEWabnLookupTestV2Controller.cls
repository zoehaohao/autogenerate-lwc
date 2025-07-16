public with sharing class NEWabnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(Map<String, Object> searchParams) {
        try {
            // Validate input parameters
            if (searchParams == null || !searchParams.containsKey('searchTerm') || !searchParams.containsKey('searchType')) {
                return new ResponseWrapper(false, 'Invalid search parameters provided.', null);
            }
            
            String searchTerm = String.valueOf(searchParams.get('searchTerm'));
            String searchType = String.valueOf(searchParams.get('searchType'));
            
            // Sanitize input
            searchTerm = sanitizeInput(searchTerm);
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term cannot be empty.', null);
            }
            
            // Validate search term based on type
            if (!validateSearchTerm(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search term format for the specified search type.', null);
            }
            
            // Perform API callout
            String apiResponse = performAPICallout(searchTerm, searchType);
            
            // Parse and process response
            Object processedData = processAPIResponse(apiResponse, searchType);
            
            return new ResponseWrapper(true, 'Search completed successfully.', processedData);
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN lookup service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        // Remove potentially harmful characters and trim
        String sanitized = input.trim();
        sanitized = sanitized.replaceAll('[<>"\']', '');
        
        return sanitized;
    }
    
    private static Boolean validateSearchTerm(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        switch (searchType.toLowerCase()) {
            case 'abn':
                // Validate 11-digit ABN format
                String cleanABN = searchTerm.replaceAll('\\s', '');
                return Pattern.matches('^\\d{11}$', cleanABN);
            case 'acn':
                // Validate 9-digit ACN format
                String cleanACN = searchTerm.replaceAll('\\s', '');
                return Pattern.matches('^\\d{9}$', cleanACN);
            case 'companyname':
                // Validate minimum 2 characters for company name
                return searchTerm.length() >= 2;
            default:
                return false;
        }
    }
    
    private static String performAPICallout(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = buildEndpointURL(searchTerm, searchType);
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            throw new CalloutException('No results found for the provided search term.');
        } else {
            throw new CalloutException('API returned status code: ' + response.getStatusCode());
        }
    }
    
    private static String buildEndpointURL(String searchTerm, String searchType) {
        String baseURL = API_ENDPOINT;
        String queryParam = '';
        
        switch (searchType.toLowerCase()) {
            case 'abn':
                queryParam = '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
            case 'acn':
                queryParam = '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
            case 'companyname':
                queryParam = '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
        }
        
        return baseURL + queryParam;
    }
    
    private static Object processAPIResponse(String responseBody, String searchType) {
        if (String.isBlank(responseBody)) {
            return new List<Object>();
        }
        
        try {
            // Safe JSON parsing
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            if (tempResult == null) {
                return new List<Object>();
            }
            
            // Handle both single result and array responses
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                List<Map<String, Object>> processedResults = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> processedItem = processResultItem((Map<String, Object>) item);
                        processedResults.add(processedItem);
                    }
                }
                
                return processedResults;
            } else if (tempResult instanceof Map<String, Object>) {
                Map<String, Object> singleResult = (Map<String, Object>) tempResult;
                Map<String, Object> processedResult = processResultItem(singleResult);
                return new List<Map<String, Object>>{ processedResult };
            }
            
            return new List<Object>();
            
        } catch (JSONException e) {
            System.debug('JSON parsing error: ' + e.getMessage());
            throw new CalloutException('Invalid response format from ABN lookup service.');
        }
    }
    
    private static Map<String, Object> processResultItem(Map<String, Object> item) {
        Map<String, Object> processedItem = new Map<String, Object>();
        
        // Safely extract nested values
        processedItem.put('abn', extractNestedValue(item, 'abn'));
        processedItem.put('entity_status', extractNestedValue(item, 'entity_status'));
        processedItem.put('entity_type', extractNestedValue(item, 'entity_type'));
        processedItem.put('other_trading_name', extractNestedValue(item, 'other_trading_name'));
        processedItem.put('goods_and_services_tax', extractNestedValue(item, 'goods_and_services_tax'));
        processedItem.put('record_last_updated_date', item.get('record_last_updated_date'));
        processedItem.put('asic_number', item.get('asic_number'));
        processedItem.put('dgr_endorsement', extractNestedValue(item, 'dgr_endorsement'));
        
        return processedItem;
    }
    
    private static Object extractNestedValue(Map<String, Object> source, String key) {
        if (source == null || !source.containsKey(key)) {
            return null;
        }
        
        return source.get(key);
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
