public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn';
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
            
            // Validate search type and term format
            String validationError = validateSearchInput(sanitizedSearchTerm, searchType);
            if (String.isNotBlank(validationError)) {
                return new ResponseWrapper(false, validationError, null);
            }
            
            // Build API endpoint with query parameters
            String endpoint = buildApiEndpoint(sanitizedSearchTerm, searchType);
            
            // Make HTTP callout
            HttpResponse response = makeHttpCallout(endpoint);
            
            // Process response
            if (response.getStatusCode() == 200) {
                List<ABNResult> results = parseApiResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', results);
            } else {
                String errorMessage = 'API Error: ' + response.getStatus() + ' (' + response.getStatusCode() + ')';
                System.debug('API Error Response: ' + response.getBody());
                return new ResponseWrapper(false, errorMessage, null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please contact your administrator.', null);
        }
    }
    
    private static String validateSearchInput(String searchTerm, String searchType) {
        switch on searchType {
            when 'ABN' {
                if (!Pattern.matches('^\\d{11}$', searchTerm)) {
                    return 'ABN must be exactly 11 digits';
                }
            }
            when 'ACN' {
                if (!Pattern.matches('^\\d{9}$', searchTerm)) {
                    return 'ACN must be exactly 9 digits';
                }
            }
            when 'NAME' {
                if (searchTerm.length() < 2) {
                    return 'Company name must be at least 2 characters';
                }
            }
            when else {
                return 'Invalid search type';
            }
        }
        return null;
    }
    
    private static String buildApiEndpoint(String searchTerm, String searchType) {
        String parameterName;
        switch on searchType {
            when 'ABN' {
                parameterName = 'abn';
            }
            when 'ACN' {
                parameterName = 'acn';
            }
            when 'NAME' {
                parameterName = 'name';
            }
            when else {
                parameterName = 'search';
            }
        }
        
        return API_ENDPOINT + '?' + parameterName + '=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
    }
    
    private static HttpResponse makeHttpCallout(String endpoint) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        return http.send(request);
    }
    
    private static List<ABNResult> parseApiResponse(String responseBody) {
        List<ABNResult> results = new List<ABNResult>();
        
        try {
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> resultMap = (Map<String, Object>) item;
                        ABNResult abnResult = new ABNResult();
                        
                        // Safe extraction of values with null checks
                        abnResult.id = getStringValue(resultMap, 'id');
                        abnResult.ABN = getStringValue(resultMap, 'ABN');
                        abnResult.ABNStatus = getStringValue(resultMap, 'ABNStatus');
                        abnResult.EntityType = getStringValue(resultMap, 'EntityType');
                        abnResult.EntityName = getStringValue(resultMap, 'EntityName');
                        abnResult.GoodsServicesGST = getStringValue(resultMap, 'GoodsServicesGST');
                        abnResult.MainBusinessLocation = getStringValue(resultMap, 'MainBusinessLocation');
                        
                        results.add(abnResult);
                    }
                }
            }
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            throw new CalloutException('Invalid response format from ABN service');
        }
        
        return results;
    }
    
    private static String getStringValue(Map<String, Object> dataMap, String key) {
        Object value = dataMap.get(key);
        return value != null ? String.valueOf(value) : '';
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
    }
    
    // ABN Result wrapper class
    public class ABNResult {
        @AuraEnabled public String id;
        @AuraEnabled public String ABN;
        @AuraEnabled public String ABNStatus;
        @AuraEnabled public String EntityType;
        @AuraEnabled public String EntityName;
        @AuraEnabled public String GoodsServicesGST;
        @AuraEnabled public String MainBusinessLocation;
        
        public ABNResult() {
            this.id = '';
            this.ABN = '';
            this.ABNStatus = '';
            this.EntityType = '';
            this.EntityName = '';
            this.GoodsServicesGST = '';
            this.MainBusinessLocation = '';
        }
    }
}
