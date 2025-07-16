public with sharing class TestabnLookupV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, String searchType) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Sanitize input
            String sanitizedSearchTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Validate search type and format
            if (!validateSearchInput(sanitizedSearchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search format for ' + searchType, null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(sanitizedSearchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response received from ABN service', null);
            }
            
            // Parse response
            Object parsedData = parseAPIResponse(apiResponse);
            
            if (parsedData == null) {
                return new ResponseWrapper(false, 'No matching results found', null);
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', parsedData);
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        switch on searchType {
            when 'ABN' {
                return Pattern.matches('^\\d{11}$', searchTerm);
            }
            when 'ACN' {
                return Pattern.matches('^\\d{9}$', searchTerm);
            }
            when 'NAME' {
                return searchTerm.length() >= 2;
            }
            when else {
                return searchTerm.length() >= 2 || Pattern.matches('^\\d{9,11}$', searchTerm);
            }
        }
    }
    
    private static String makeAPICall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        String queryParam = buildQueryParameter(searchTerm, searchType);
        
        if (String.isNotBlank(queryParam)) {
            endpoint += '?' + queryParam;
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            throw new CalloutException('No results found for the provided search criteria');
        } else {
            throw new CalloutException('API returned status code: ' + response.getStatusCode());
        }
    }
    
    private static String buildQueryParameter(String searchTerm, String searchType) {
        switch on searchType {
            when 'ABN' {
                return 'abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'ACN' {
                return 'acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'NAME' {
                return 'name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when else {
                // Auto-detect based on format
                if (Pattern.matches('^\\d{11}$', searchTerm)) {
                    return 'abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                } else if (Pattern.matches('^\\d{9}$', searchTerm)) {
                    return 'acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                } else {
                    return 'name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                }
            }
        }
    }
    
    private static Object parseAPIResponse(String jsonResponse) {
        try {
            Object tempData = JSON.deserializeUntyped(jsonResponse);
            
            if (tempData == null) {
                return null;
            }
            
            // Handle both single object and array responses
            if (tempData instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempData;
                if (tempList.isEmpty()) {
                    return null;
                }
                
                List<Map<String, Object>> resultList = new List<Map<String, Object>>();
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        resultList.add((Map<String, Object>) item);
                    }
                }
                return resultList;
            } else if (tempData instanceof Map<String, Object>) {
                Map<String, Object> dataMap = (Map<String, Object>) tempData;
                
                // Check if the response contains valid ABN data
                if (dataMap.containsKey('abn') || dataMap.containsKey('entity_status')) {
                    return dataMap;
                }
            }
            
            return null;
            
        } catch (JSONException e) {
            System.debug('JSON Parse Exception: ' + e.getMessage());
            throw new CalloutException('Invalid response format from ABN service');
        }
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
    
    // Test method for API connectivity
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testAPIConnection() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT);
            request.setMethod('GET');
            request.setTimeout(10000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return new ResponseWrapper(true, 'API connection successful', null);
            } else {
                return new ResponseWrapper(false, 'API connection failed with status: ' + response.getStatusCode(), null);
            }
            
        } catch (Exception e) {
            return new ResponseWrapper(false, 'API connection test failed: ' + e.getMessage(), null);
        }
    }
}
