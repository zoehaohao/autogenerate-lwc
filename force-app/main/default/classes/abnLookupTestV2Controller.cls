public with sharing class abnLookupTestV2Controller {
    
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
            
            // Sanitize input
            searchTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Validate search term based on type
            String validationError = validateSearchTerm(searchTerm, searchType);
            if (String.isNotBlank(validationError)) {
                return new ResponseWrapper(false, validationError, null);
            }
            
            // Make API call
            HttpResponse response = makeAPICall(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                Object responseData = JSON.deserializeUntyped(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', responseData);
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            } else {
                System.debug('API Error - Status: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'Search service temporarily unavailable. Please try again later.', null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to search service. Please check your connection and try again.', null);
        } catch (Exception e) {
            System.debug('Unexpected Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static String validateSearchTerm(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return 'Search term cannot be empty';
        }
        
        if (searchType == 'ABN') {
            if (!Pattern.matches('^\\d{11}$', searchTerm)) {
                return 'ABN must be exactly 11 digits';
            }
            if (!isValidABN(searchTerm)) {
                return 'Invalid ABN format';
            }
        } else if (searchType == 'ACN') {
            if (!Pattern.matches('^\\d{9}$', searchTerm)) {
                return 'ACN must be exactly 9 digits';
            }
        } else if (searchType == 'NAME') {
            if (searchTerm.length() < 2) {
                return 'Company name must be at least 2 characters';
            }
            if (searchTerm.length() > 200) {
                return 'Company name cannot exceed 200 characters';
            }
        }
        
        return null;
    }
    
    private static Boolean isValidABN(String abn) {
        try {
            List<Integer> weights = new List<Integer>{10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
            Integer sum = 0;
            
            // Subtract 1 from the first digit
            Integer firstDigit = Integer.valueOf(abn.substring(0, 1)) - 1;
            sum += firstDigit * weights[0];
            
            // Add the remaining digits multiplied by their weights
            for (Integer i = 1; i < 11; i++) {
                Integer digit = Integer.valueOf(abn.substring(i, i + 1));
                sum += digit * weights[i];
            }
            
            return Math.mod(sum, 89) == 0;
        } catch (Exception e) {
            System.debug('ABN validation error: ' + e.getMessage());
            return false;
        }
    }
    
    private static HttpResponse makeAPICall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        if (searchType == 'ABN') {
            endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        } else if (searchType == 'NAME' || searchType == 'ACN') {
            endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
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
