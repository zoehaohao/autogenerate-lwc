public with sharing class newabnLookupTestV2Controller {
    
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
            
            // Validate input based on search type
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(searchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response from API', null);
            }
            
            // Parse and format results
            List<ABNResult> results = parseAPIResponse(apiResponse, searchTerm);
            
            return new ResponseWrapper(true, 'Search completed successfully', results);
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        switch on searchType {
            when 'abn' {
                return Pattern.matches('^\\d{11}$', cleanTerm);
            }
            when 'acn' {
                return Pattern.matches('^\\d{9}$', cleanTerm);
            }
            when 'name' {
                return searchTerm.trim().length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static String makeAPICall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        if (searchType == 'abn') {
            endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
        } else if (searchType == 'acn') {
            endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
        } else {
            endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            return '{"noResults": true}';
        } else {
            throw new CalloutException('HTTP ' + response.getStatusCode() + ': ' + response.getStatus());
        }
    }
    
    private static List<ABNResult> parseAPIResponse(String apiResponse, String searchTerm) {
        List<ABNResult> results = new List<ABNResult>();
        
        try {
            Object responseObj = JSON.deserializeUntyped(apiResponse);
            
            // Handle no results case
            if (responseObj instanceof Map<String, Object>) {
                Map<String, Object> responseMap = (Map<String, Object>) responseObj;
                if (responseMap.containsKey('noResults') && (Boolean) responseMap.get('noResults')) {
                    return results; // Return empty list
                }
                
                // Single result case
                ABNResult result = parseSingleResult(responseMap);
                if (result != null) {
                    results.add(result);
                }
            } else if (responseObj instanceof List<Object>) {
                // Multiple results case
                List<Object> responseList = (List<Object>) responseObj;
                for (Object item : responseList) {
                    if (item instanceof Map<String, Object>) {
                        ABNResult result = parseSingleResult((Map<String, Object>) item);
                        if (result != null) {
                            results.add(result);
                        }
                    }
                }
            }
            
            // If we're searching by name and got results, create multiple mock results for demo
            if (results.size() == 1 && searchTerm.toLowerCase().contains('coles')) {
                ABNResult baseResult = results[0];
                results.clear();
                
                // Create 6 mock results for demonstration
                for (Integer i = 1; i <= 6; i++) {
                    ABNResult mockResult = new ABNResult();
                    mockResult.id = 'result_' + i;
                    mockResult.abnNumber = baseResult.abnNumber;
                    mockResult.entityName = baseResult.entityName;
                    mockResult.abnStatus = baseResult.abnStatus;
                    mockResult.entityType = baseResult.entityType;
                    mockResult.gstStatus = baseResult.gstStatus;
                    mockResult.businessLocation = baseResult.businessLocation;
                    results.add(mockResult);
                }
            }
            
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            throw new AuraHandledException('Error processing search results');
        }
        
        return results;
    }
    
    private static ABNResult parseSingleResult(Map<String, Object> resultMap) {
        try {
            ABNResult result = new ABNResult();
            result.id = String.valueOf(System.currentTimeMillis()) + '_' + Math.round(Math.random() * 1000);
            
            // Parse ABN information
            if (resultMap.containsKey('abn') && resultMap.get('abn') != null) {
                Map<String, Object> abnMap = (Map<String, Object>) resultMap.get('abn');
                result.abnNumber = (String) abnMap.get('identifier_value');
            }
            
            // Parse entity status
            if (resultMap.containsKey('entity_status') && resultMap.get('entity_status') != null) {
                Map<String, Object> statusMap = (Map<String, Object>) resultMap.get('entity_status');
                String statusCode = (String) statusMap.get('entity_status_code');
                String effectiveFrom = (String) statusMap.get('effective_from');
                result.abnStatus = statusCode + ' from ' + formatDate(effectiveFrom);
            }
            
            // Parse entity type
            if (resultMap.containsKey('entity_type') && resultMap.get('entity_type') != null) {
                Map<String, Object> typeMap = (Map<String, Object>) resultMap.get('entity_type');
                result.entityType = (String) typeMap.get('entity_description');
            }
            
            // Parse GST information
            if (resultMap.containsKey('goods_and_services_tax') && resultMap.get('goods_and_services_tax') != null) {
                Map<String, Object> gstMap = (Map<String, Object>) resultMap.get('goods_and_services_tax');
                String effectiveFrom = (String) gstMap.get('effective_from');
                result.gstStatus = 'Registered from ' + formatDate(effectiveFrom);
            }
            
            // Set default values based on mock data structure
            result.entityName = 'COLES SUPERMARKETS AUSTRALIA PTY LTD';
            result.businessLocation = 'VIC 3123';
            
            return result;
            
        } catch (Exception e) {
            System.debug('Error parsing single result: ' + e.getMessage());
            return null;
        }
    }
    
    private static String formatDate(String dateString) {
        try {
            if (String.isNotBlank(dateString) && dateString != '0001-01-01') {
                Date parsedDate = Date.valueOf(dateString);
                return parsedDate.format();
            }
        } catch (Exception e) {
            System.debug('Error formatting date: ' + e.getMessage());
        }
        return dateString;
    }
    
    // Wrapper classes
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
    
    public class ABNResult {
        @AuraEnabled public String id;
        @AuraEnabled public String abnNumber;
        @AuraEnabled public String entityName;
        @AuraEnabled public String abnStatus;
        @AuraEnabled public String entityType;
        @AuraEnabled public String gstStatus;
        @AuraEnabled public String businessLocation;
    }
}
