public with sharing class newabnLookupTestV2Controller {
    
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
            
            String searchValue = (String) params.get('searchValue');
            String searchType = (String) params.get('searchType');
            
            if (String.isBlank(searchValue)) {
                return new ResponseWrapper(false, 'Search value is required', null);
            }
            
            // Validate input based on search type
            if (!validateSearchInput(searchValue, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Perform API callout
            Object apiResponse = performAPICallout(searchValue, searchType);
            
            if (apiResponse != null) {
                return new ResponseWrapper(true, 'Search completed successfully', apiResponse);
            } else {
                return new ResponseWrapper(false, 'No results found', null);
            }
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'Search failed: ' + e.getMessage(), null);
        }
    }
    
    private static Boolean validateSearchInput(String searchValue, String searchType) {
        if (String.isBlank(searchValue)) {
            return false;
        }
        
        String cleanValue = searchValue.replaceAll('\\s', '');
        
        switch on searchType {
            when 'ABN' {
                return Pattern.matches('^\\d{11}$', cleanValue);
            }
            when 'ACN' {
                return Pattern.matches('^\\d{9}$', cleanValue);
            }
            when 'NAME' {
                return cleanValue.length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static Object performAPICallout(String searchValue, String searchType) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameters
            String endpoint = buildEndpointWithParams(searchValue, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                String responseBody = response.getBody();
                
                if (String.isNotBlank(responseBody)) {
                    // Safe JSON parsing
                    Object tempResult = JSON.deserializeUntyped(responseBody);
                    return tempResult;
                }
            } else if (response.getStatusCode() == 404) {
                System.debug('No results found for search: ' + searchValue);
                return null;
            } else {
                throw new CalloutException('API returned status code: ' + response.getStatusCode() + 
                                         ' with message: ' + response.getBody());
            }
            
        } catch (CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            throw new AuraHandledException('Unable to connect to ABN lookup service: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('Unexpected error in API callout: ' + e.getMessage());
            throw new AuraHandledException('Search service temporarily unavailable: ' + e.getMessage());
        }
        
        return null;
    }
    
    private static String buildEndpointWithParams(String searchValue, String searchType) {
        String endpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
        switch on searchType {
            when 'ABN' {
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchValue, 'UTF-8');
            }
            when 'ACN' {
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchValue, 'UTF-8');
            }
            when 'NAME' {
                endpoint += '?name=' + EncodingUtil.urlEncode(searchValue, 'UTF-8');
            }
        }
        
        return endpoint;
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
