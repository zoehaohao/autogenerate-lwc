public with sharing class MyFormabnController {
    
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
            
            String searchTerm = (String) params.get('searchTerm');
            String searchType = (String) params.get('searchType');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate input based on search type
            String validationError = validateSearchInput(searchTerm, searchType);
            if (String.isNotBlank(validationError)) {
                return new ResponseWrapper(false, validationError, null);
            }
            
            // Perform API callout
            HttpResponse response = performAPICallout(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                // Parse and process response
                Object responseData = parseAPIResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', responseData);
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'No results found', null);
            } else {
                String errorMsg = 'API request failed with status: ' + response.getStatusCode();
                System.debug('API Error: ' + errorMsg + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, errorMsg, null);
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
    
    private static String validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return 'Search term cannot be empty';
        }
        
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        switch on searchType {
            when 'abn' {
                if (!Pattern.matches('^\\d{11}$', cleanTerm)) {
                    return 'ABN must be exactly 11 digits';
                }
            }
            when 'acn' {
                if (!Pattern.matches('^\\d{9}$', cleanTerm)) {
                    return 'ACN must be exactly 9 digits';
                }
            }
            when 'name' {
                if (searchTerm.trim().length() < 2) {
                    return 'Company name must be at least 2 characters';
                }
            }
            when else {
                return 'Invalid search type';
            }
        }
        
        return null;
    }
    
    private static HttpResponse performAPICallout(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = buildEndpointWithParams(searchTerm, searchType);
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        System.debug('API Request - Endpoint: ' + endpoint);
        
        HttpResponse response = http.send(request);
        
        System.debug('API Response - Status: ' + response.getStatusCode());
        System.debug('API Response - Body: ' + response.getBody());
        
        return response;
    }
    
    private static String buildEndpointWithParams(String searchTerm, String searchType) {
        String endpoint = API_ENDPOINT;
        String paramName;
        
        switch on searchType {
            when 'abn' {
                paramName = 'abn';
            }
            when 'acn' {
                paramName = 'acn';
            }
            when 'name' {
                paramName = 'name';
            }
            when else {
                paramName = 'name';
            }
        }
        
        // URL encode the search term
        String encodedSearchTerm = EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        endpoint += '?' + paramName + '=' + encodedSearchTerm;
        
        return endpoint;
    }
    
    private static Object parseAPIResponse(String responseBody) {
        if (String.isBlank(responseBody)) {
            return null;
        }
        
        try {
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            // Handle both single object and array responses
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        results.add((Map<String, Object>) item);
                    }
                }
                
                return results;
            } else if (tempResult instanceof Map<String, Object>) {
                return (Map<String, Object>) tempResult;
            }
            
            return tempResult;
            
        } catch (JSONException e) {
            System.debug('JSON Parse Error: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from API');
        }
    }
    
    // Helper method for testing
    @TestVisible
    private static ResponseWrapper createMockResponse() {
        Map<String, Object> mockData = new Map<String, Object>{
            'record_last_updated_date' => '2022-02-24',
            'abn' => new Map<String, Object>{
                'identifier_value' => '44121436162',
                'is_current_indicator' => 'Y',
                'replaced_from' => '0001-01-01'
            },
            'entity_status' => new Map<String, Object>{
                'entity_status_code' => 'Active',
                'effective_from' => '2002-09-06',
                'effective_to' => '0001-01-01'
            },
            'other_trading_name' => new Map<String, Object>{
                'organisation_name' => 'COLES SUPERMARKETS AUSTRALIA PTY LTD',
                'effective_from' => '2002-09-06',
                'effective_to' => '0001-01-01'
            },
            'asic_number' => 'VIC 3123',
            'entity_type' => new Map<String, Object>{
                'entity_type_code' => 'APC',
                'entity_description' => 'Australian Private Company'
            },
            'goods_and_services_tax' => new Map<String, Object>{
                'effective_from' => '2002-07-01',
                'effective_to' => '0001-01-01'
            }
        };
        
        return new ResponseWrapper(true, 'Mock response', mockData);
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
