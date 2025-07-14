public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            if (String.isBlank(searchParams)) {
                return new ResponseWrapper(false, 'Search parameters are required', null);
            }
            
            Object tempParams = JSON.deserializeUntyped(searchParams);
            Map<String, Object> params = (Map<String, Object>) tempParams;
            
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
            HttpResponse response = makeAPICall(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                Object responseData = JSON.deserializeUntyped(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', responseData);
            } else {
                String errorMessage = 'API call failed with status: ' + response.getStatusCode();
                System.debug('API Error: ' + errorMessage + ' - Body: ' + response.getBody());
                return new ResponseWrapper(false, errorMessage, null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Network error occurred. Please check your connection and try again.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred: ' + e.getMessage(), null);
        }
    }
    
    private static Boolean validateSearchTerm(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String trimmedTerm = searchTerm.trim();
        
        switch on searchType {
            when 'abn' {
                return Pattern.matches('^\\d{11}$', trimmedTerm);
            }
            when 'acn' {
                return Pattern.matches('^\\d{9}$', trimmedTerm);
            }
            when 'name' {
                return trimmedTerm.length() >= 2;
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
        Map<String, String> queryParams = new Map<String, String>();
        
        switch on searchType {
            when 'abn' {
                queryParams.put('abn', searchTerm);
            }
            when 'acn' {
                queryParams.put('acn', searchTerm);
            }
            when 'name' {
                queryParams.put('name', searchTerm);
            }
        }
        
        // Add query parameters to endpoint
        if (!queryParams.isEmpty()) {
            List<String> paramStrings = new List<String>();
            for (String key : queryParams.keySet()) {
                paramStrings.add(key + '=' + EncodingUtil.urlEncode(queryParams.get(key), 'UTF-8'));
            }
            endpoint += '?' + String.join(paramStrings, '&');
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        System.debug('Making API call to: ' + endpoint);
        
        HttpResponse response = http.send(request);
        
        System.debug('API Response Status: ' + response.getStatusCode());
        System.debug('API Response Body: ' + response.getBody());
        
        return response;
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
        
        public ResponseWrapper(Boolean success, String message, Object data, List<String> errors) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = errors != null ? errors : new List<String>();
        }
    }
}
