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
            
            String searchTerm = (String) params.get('searchTerm');
            String searchType = (String) params.get('searchType');
            Integer maxResults = (Integer) params.get('maxResults');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate search term based on type
            String validationError = validateSearchTerm(searchTerm, searchType);
            if (validationError != null) {
                return new ResponseWrapper(false, validationError, null);
            }
            
            // Perform API callout
            HttpResponse response = performAPICallout(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                // Parse response
                Object responseData = parseAPIResponse(response.getBody());
                
                if (responseData != null) {
                    return new ResponseWrapper(true, 'Search completed successfully', responseData);
                } else {
                    return new ResponseWrapper(true, 'No results found', new List<Object>());
                }
            } else {
                String errorMsg = handleHTTPError(response.getStatusCode(), response.getStatus());
                return new ResponseWrapper(false, errorMsg, null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN lookup service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please contact your administrator.', null);
        }
    }
    
    private static String validateSearchTerm(String searchTerm, String searchType) {
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
                if (searchTerm.length() < 2) {
                    return 'Company name must be at least 2 characters';
                }
                if (searchTerm.length() > 200) {
                    return 'Company name cannot exceed 200 characters';
                }
            }
            when else {
                return 'Invalid search type specified';
            }
        }
        
        return null;
    }
    
    private static HttpResponse performAPICallout(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = buildEndpointURL(searchTerm, searchType);
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        // Add any additional headers if required by the API
        // request.setHeader('Authorization', 'Bearer ' + getAPIToken());
        
        return http.send(request);
    }
    
    private static String buildEndpointURL(String searchTerm, String searchType) {
        String endpoint = API_ENDPOINT;
        
        // Build query parameters based on search type
        Map<String, String> queryParams = new Map<String, String>();
        
        switch on searchType {
            when 'abn' {
                queryParams.put('abn', EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8'));
            }
            when 'acn' {
                queryParams.put('acn', EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8'));
            }
            when 'name' {
                queryParams.put('name', EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            }
        }
        
        // Add query parameters to endpoint
        if (!queryParams.isEmpty()) {
            List<String> paramStrings = new List<String>();
            for (String key : queryParams.keySet()) {
                paramStrings.add(key + '=' + queryParams.get(key));
            }
            endpoint += '?' + String.join(paramStrings, '&');
        }
        
        return endpoint;
    }
    
    private static Object parseAPIResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return null;
            }
            
            Object tempResponse = JSON.deserializeUntyped(responseBody);
            
            // Handle both single object and array responses
            if (tempResponse instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResponse;
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        results.add((Map<String, Object>) item);
                    }
                }
                
                return results;
            } else if (tempResponse instanceof Map<String, Object>) {
                // Single result - wrap in array for consistency
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                results.add((Map<String, Object>) tempResponse);
                return results;
            }
            
            return null;
            
        } catch (JSONException e) {
            System.debug('JSON Parse Error: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN lookup service');
        }
    }
    
    private static String handleHTTPError(Integer statusCode, String status) {
        switch on statusCode {
            when 400 {
                return 'Invalid search parameters. Please check your input and try again.';
            }
            when 401 {
                return 'Authentication failed. Please contact your administrator.';
            }
            when 403 {
                return 'Access denied. You do not have permission to perform this search.';
            }
            when 404 {
                return 'ABN lookup service is currently unavailable. Please try again later.';
            }
            when 429 {
                return 'Too many requests. Please wait a moment and try again.';
            }
            when 500 {
                return 'ABN lookup service is experiencing technical difficulties. Please try again later.';
            }
            when 503 {
                return 'ABN lookup service is temporarily unavailable. Please try again later.';
            }
            when else {
                return 'An error occurred while searching (' + statusCode + '). Please try again.';
            }
        }
    }
    
    // Utility method for testing
    @TestVisible
    private static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        // Remove potentially harmful characters
        String sanitized = input.replaceAll('[<>"\']', '');
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        return sanitized;
    }
    
    // Response wrapper class
    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Object data;
        @AuraEnabled public List<String> errors;
        @AuraEnabled public String timestamp;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = new List<String>();
            this.timestamp = DateTime.now().formatGMT('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        }
        
        public ResponseWrapper(Boolean success, String message, Object data, List<String> errors) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = errors != null ? errors : new List<String>();
            this.timestamp = DateTime.now().formatGMT('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        }
    }
    
    // Test data generation for development/testing
    @TestVisible
    private static Object generateMockResponse(String searchTerm, String searchType) {
        Map<String, Object> mockResult = new Map<String, Object>();
        
        // Generate mock ABN data
        mockResult.put('record_last_updated_date', '2022-02-24');
        
        Map<String, Object> abnInfo = new Map<String, Object>();
        abnInfo.put('identifier_value', '45004189708');
        abnInfo.put('is_current_indicator', 'Y');
        abnInfo.put('replaced_from', '0001-01-01');
        mockResult.put('abn', abnInfo);
        
        Map<String, Object> entityStatus = new Map<String, Object>();
        entityStatus.put('entity_status_code', 'Active');
        entityStatus.put('effective_from', '2002-09-06');
        entityStatus.put('effective_to', '0001-01-01');
        mockResult.put('entity_status', entityStatus);
        
        Map<String, Object> tradingName = new Map<String, Object>();
        tradingName.put('organisation_name', 'COLES SUPERMARKETS AUSTRALIA PTY LTD');
        tradingName.put('effective_from', '2002-09-06');
        tradingName.put('effective_to', '0001-01-01');
        mockResult.put('other_trading_name', tradingName);
        
        mockResult.put('asic_number', '1234');
        
        Map<String, Object> entityType = new Map<String, Object>();
        entityType.put('entity_type_code', 'APC');
        entityType.put('entity_description', 'Australian Private Company');
        mockResult.put('entity_type', entityType);
        
        Map<String, Object> gstInfo = new Map<String, Object>();
        gstInfo.put('effective_from', '2002-07-01');
        gstInfo.put('effective_to', '0001-01-01');
        mockResult.put('goods_and_services_tax', gstInfo);
        
        mockResult.put('main_business_location', 'VIC 3123');
        
        // Return as single item array for consistency
        List<Map<String, Object>> results = new List<Map<String, Object>>();
        results.add(mockResult);
        
        return results;
    }
}
