public with sharing class abnLookupTestV2Controller {
    
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
            String sanitizedTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Validate search type
            if (!isValidSearchType(searchType)) {
                return new ResponseWrapper(false, 'Invalid search type', null);
            }
            
            // Perform API callout
            HttpResponse response = performAPICallout(sanitizedTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                // Parse response safely
                Object responseData = parseAPIResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', responseData);
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            } else {
                String errorMsg = 'API returned status code: ' + response.getStatusCode();
                System.debug('API Error: ' + errorMsg + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, errorMsg, null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static Boolean isValidSearchType(String searchType) {
        Set<String> validTypes = new Set<String>{'abn', 'acn', 'name'};
        return validTypes.contains(searchType?.toLowerCase());
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
        
        return http.send(request);
    }
    
    private static String buildEndpointWithParams(String searchTerm, String searchType) {
        String baseEndpoint = API_ENDPOINT;
        String paramName;
        
        // Determine parameter name based on search type
        switch on searchType.toLowerCase() {
            when 'abn' {
                paramName = 'abn';
            }
            when 'acn' {
                paramName = 'acn';
            }
            when else {
                paramName = 'name';
            }
        }
        
        // URL encode the search term
        String encodedTerm = EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        
        return baseEndpoint + '?' + paramName + '=' + encodedTerm;
    }
    
    private static Object parseAPIResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return new List<Object>();
            }
            
            // Safe JSON parsing
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            if (tempResult == null) {
                return new List<Object>();
            }
            
            // Handle both single object and array responses
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                List<Map<String, Object>> resultList = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        resultList.add((Map<String, Object>) item);
                    }
                }
                
                return resultList;
            } else if (tempResult instanceof Map<String, Object>) {
                // Single result - convert to list for consistency
                Map<String, Object> singleResult = (Map<String, Object>) tempResult;
                return new List<Map<String, Object>>{singleResult};
            }
            
            return new List<Object>();
            
        } catch (JSONException e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN service');
        }
    }
    
    // Test method for API connectivity
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testAPIConnection() {
        try {
            HttpResponse response = performAPICallout('test', 'name');
            
            return new ResponseWrapper(
                true, 
                'API connection test completed. Status: ' + response.getStatusCode(),
                new Map<String, Object>{
                    'statusCode' => response.getStatusCode(),
                    'status' => response.getStatus(),
                    'responseSize' => response.getBody()?.length()
                }
            );
            
        } catch (Exception e) {
            return new ResponseWrapper(false, 'API connection failed: ' + e.getMessage(), null);
        }
    }
    
    // Utility method for input validation
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper validateSearchInput(String searchTerm, String searchType) {
        try {
            List<String> errors = new List<String>();
            
            if (String.isBlank(searchTerm)) {
                errors.add('Search term is required');
            } else if (searchTerm.trim().length() < 2) {
                errors.add('Search term must be at least 2 characters');
            }
            
            String cleanTerm = searchTerm?.replaceAll('\\s', '');
            
            switch on searchType?.toLowerCase() {
                when 'abn' {
                    if (!Pattern.matches('^\\d{11}$', cleanTerm)) {
                        errors.add('ABN must be exactly 11 digits');
                    }
                }
                when 'acn' {
                    if (!Pattern.matches('^\\d{9}$', cleanTerm)) {
                        errors.add('ACN must be exactly 9 digits');
                    }
                }
                when 'name' {
                    if (searchTerm?.trim().length() < 2) {
                        errors.add('Company name must be at least 2 characters');
                    }
                }
                when else {
                    errors.add('Invalid search type');
                }
            }
            
            Boolean isValid = errors.isEmpty();
            String message = isValid ? 'Validation passed' : String.join(errors, '; ');
            
            return new ResponseWrapper(isValid, message, new Map<String, Object>{
                'isValid' => isValid,
                'errors' => errors,
                'searchType' => searchType,
                'cleanedTerm' => cleanTerm
            });
            
        } catch (Exception e) {
            return new ResponseWrapper(false, 'Validation error: ' + e.getMessage(), null);
        }
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
}
