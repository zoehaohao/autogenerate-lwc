public with sharing class MyABNFormController {
    
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
            HttpResponse response = makeAPICall(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                Object responseData = parseAPIResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', responseData);
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            } else {
                return new ResponseWrapper(false, 'API returned error: ' + response.getStatus(), null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('Search error: ' + e.getMessage());
            return new ResponseWrapper(false, 'An error occurred during search. Please try again.', null);
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
    
    private static HttpResponse makeAPICall(String searchTerm, String searchType) {
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
        
        return http.send(request);
    }
    
    private static String buildQueryParameter(String searchTerm, String searchType) {
        String cleanTerm = EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
        
        switch on searchType {
            when 'abn' {
                return 'abn=' + cleanTerm;
            }
            when 'acn' {
                return 'acn=' + cleanTerm;
            }
            when 'name' {
                return 'name=' + cleanTerm;
            }
            when else {
                return 'q=' + cleanTerm;
            }
        }
    }
    
    private static Object parseAPIResponse(String responseBody) {
        if (String.isBlank(responseBody)) {
            return new List<Object>();
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
                // Single result - return as single item array for consistency
                return new List<Map<String, Object>>{ (Map<String, Object>) tempResult };
            } else {
                return new List<Object>();
            }
            
        } catch (JSONException e) {
            System.debug('JSON parsing error: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN service');
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
    
    // Test method for validation
    @TestVisible
    private static Boolean isValidABN(String abn) {
        if (String.isBlank(abn)) return false;
        
        String cleanABN = abn.replaceAll('\\s', '');
        if (!Pattern.matches('^\\d{11}$', cleanABN)) return false;
        
        // ABN checksum validation (simplified)
        List<Integer> weights = new List<Integer>{10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
        Integer sum = 0;
        
        for (Integer i = 0; i < 11; i++) {
            Integer digit = Integer.valueOf(cleanABN.substring(i, i + 1));
            if (i == 0) digit -= 1; // Subtract 1 from first digit
            sum += digit * weights[i];
        }
        
        return Math.mod(sum, 89) == 0;
    }
}
