public with sharing class newLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            if (String.isBlank(searchParams)) {
                return new ResponseWrapper(false, 'Search parameters are required', null);
            }
            
            Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(searchParams);
            String searchTerm = (String) params.get('searchTerm');
            String searchType = (String) params.get('searchType');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate search term based on type
            if (!validateSearchTerm(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search term format', null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(searchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response from API', null);
            }
            
            // Parse and process response
            List<Map<String, Object>> processedResults = processAPIResponse(apiResponse);
            
            return new ResponseWrapper(true, 'Search completed successfully', processedResults);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An error occurred while searching: ' + e.getMessage(), null);
        }
    }
    
    private static Boolean validateSearchTerm(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String trimmedTerm = searchTerm.trim();
        
        switch on searchType {
            when 'ABN' {
                return Pattern.matches('^\\d{11}$', trimmedTerm);
            }
            when 'ACN' {
                return Pattern.matches('^\\d{9}$', trimmedTerm);
            }
            when 'NAME' {
                return trimmedTerm.length() >= 2 && Pattern.matches('^[a-zA-Z0-9\\s&.-]+$', trimmedTerm);
            }
            when else {
                return false;
            }
        }
    }
    
    private static String makeAPICall(String searchTerm, String searchType) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameters
            String endpoint = buildEndpoint(searchTerm, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return response.getBody();
            } else if (response.getStatusCode() == 404) {
                return '[]'; // Return empty array for no results
            } else {
                throw new CalloutException('API returned status code: ' + response.getStatusCode() + ' - ' + response.getStatus());
            }
            
        } catch (CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            throw new AuraHandledException('Unable to connect to ABN lookup service: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('Unexpected error in API call: ' + e.getMessage());
            throw new AuraHandledException('An unexpected error occurred during the search');
        }
    }
    
    private static String buildEndpoint(String searchTerm, String searchType) {
        String endpoint = API_ENDPOINT;
        
        switch on searchType {
            when 'ABN' {
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'ACN' {
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'NAME' {
                endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
        }
        
        return endpoint;
    }
    
    private static List<Map<String, Object>> processAPIResponse(String apiResponse) {
        List<Map<String, Object>> results = new List<Map<String, Object>>();
        
        try {
            Object tempResult = JSON.deserializeUntyped(apiResponse);
            
            // Handle single result or array of results
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> resultItem = processBusinessEntity((Map<String, Object>) item);
                        if (resultItem != null) {
                            results.add(resultItem);
                        }
                    }
                }
            } else if (tempResult instanceof Map<String, Object>) {
                Map<String, Object> resultItem = processBusinessEntity((Map<String, Object>) tempResult);
                if (resultItem != null) {
                    results.add(resultItem);
                }
            }
            
        } catch (Exception e) {
            System.debug('Error processing API response: ' + e.getMessage());
            throw new AuraHandledException('Error processing search results');
        }
        
        return results;
    }
    
    private static Map<String, Object> processBusinessEntity(Map<String, Object> entity) {
        try {
            Map<String, Object> result = new Map<String, Object>();
            
            // Extract ABN information
            if (entity.containsKey('abn') && entity.get('abn') != null) {
                Map<String, Object> abnData = (Map<String, Object>) entity.get('abn');
                result.put('abnNumber', abnData.get('identifier_value'));
            }
            
            // Extract entity name from other_trading_name
            if (entity.containsKey('other_trading_name') && entity.get('other_trading_name') != null) {
                Map<String, Object> tradingName = (Map<String, Object>) entity.get('other_trading_name');
                result.put('entityName', tradingName.get('organisation_name'));
            }
            
            // Extract entity status
            if (entity.containsKey('entity_status') && entity.get('entity_status') != null) {
                Map<String, Object> entityStatus = (Map<String, Object>) entity.get('entity_status');
                String statusCode = (String) entityStatus.get('entity_status_code');
                String effectiveFrom = (String) entityStatus.get('effective_from');
                if (String.isNotBlank(statusCode) && String.isNotBlank(effectiveFrom)) {
                    result.put('abnStatus', statusCode + ' from ' + formatDate(effectiveFrom));
                }
            }
            
            // Extract entity type
            if (entity.containsKey('entity_type') && entity.get('entity_type') != null) {
                Map<String, Object> entityType = (Map<String, Object>) entity.get('entity_type');
                result.put('entityType', entityType.get('entity_description'));
            }
            
            // Extract GST information
            if (entity.containsKey('goods_and_services_tax') && entity.get('goods_and_services_tax') != null) {
                Map<String, Object> gstData = (Map<String, Object>) entity.get('goods_and_services_tax');
                String effectiveFrom = (String) gstData.get('effective_from');
                if (String.isNotBlank(effectiveFrom)) {
                    result.put('gstStatus', 'Registered from ' + formatDate(effectiveFrom));
                }
            }
            
            // Extract ASIC number as main business location (based on sample response)
            if (entity.containsKey('asic_number') && entity.get('asic_number') != null) {
                result.put('mainBusinessLocation', 'VIC ' + entity.get('asic_number'));
            }
            
            return result;
            
        } catch (Exception e) {
            System.debug('Error processing business entity: ' + e.getMessage());
            return null;
        }
    }
    
    private static String formatDate(String dateString) {
        try {
            if (String.isBlank(dateString) || dateString == '0001-01-01') {
                return '';
            }
            
            Date parsedDate = Date.valueOf(dateString);
            return parsedDate.format();
            
        } catch (Exception e) {
            return dateString; // Return original if parsing fails
        }
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
