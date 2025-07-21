public with sharing class abnLookupController {
    
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
            
            // Parse and return response
            Object parsedResponse = parseAPIResponse(apiResponse);
            
            return new ResponseWrapper(true, 'Search completed successfully', parsedResponse);
            
        } catch (Exception e) {
            System.debug('ABN Lookup Error: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            
            String userMessage = getUserFriendlyErrorMessage(e);
            return new ResponseWrapper(false, userMessage, null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        searchTerm = searchTerm.trim();
        
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
                return false;
            }
        }
    }
    
    private static String makeAPICall(String searchTerm, String searchType) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameters
            String endpoint = buildEndpointWithParams(searchTerm, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return response.getBody();
            } else if (response.getStatusCode() == 404) {
                throw new AbnLookupException('No business found with the provided search criteria');
            } else if (response.getStatusCode() >= 500) {
                throw new AbnLookupException('Service temporarily unavailable. Please try again later.');
            } else {
                throw new AbnLookupException('API request failed with status: ' + response.getStatusCode());
            }
            
        } catch (System.CalloutException e) {
            if (e.getMessage().contains('timeout')) {
                throw new AbnLookupException('Request timeout. Please try again.');
            } else {
                throw new AbnLookupException('Unable to connect to ABN lookup service');
            }
        }
    }
    
    private static String buildEndpointWithParams(String searchTerm, String searchType) {
        String endpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
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
    
    private static Object parseAPIResponse(String apiResponse) {
        try {
            Object tempData = JSON.deserializeUntyped(apiResponse);
            
            if (tempData == null) {
                throw new AbnLookupException('Empty response from API');
            }
            
            // Handle both single object and array responses
            if (tempData instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempData;
                List<Map<String, Object>> resultList = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        resultList.add((Map<String, Object>) item);
                    }
                }
                
                return resultList;
            } else if (tempData instanceof Map<String, Object>) {
                return (Map<String, Object>) tempData;
            } else {
                throw new AbnLookupException('Unexpected response format from API');
            }
            
        } catch (JSONException e) {
            throw new AbnLookupException('Invalid response format from API');
        }
    }
    
    private static String getUserFriendlyErrorMessage(Exception e) {
        if (e instanceof AbnLookupException) {
            return e.getMessage();
        } else if (e instanceof System.CalloutException) {
            return 'Unable to connect to ABN lookup service. Please check your internet connection and try again.';
        } else if (e instanceof JSONException) {
            return 'Received invalid data from ABN lookup service. Please try again.';
        } else {
            return 'An unexpected error occurred. Please try again or contact your administrator.';
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
    
    public class AbnLookupException extends Exception {}
}
