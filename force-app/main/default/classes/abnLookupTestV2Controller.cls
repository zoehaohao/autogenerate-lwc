public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, String searchType) {
        try {
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate input based on search type
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Make API callout
            String endpoint = buildEndpoint(searchTerm, searchType);
            HttpResponse response = makeHttpCallout(endpoint);
            
            if (response.getStatusCode() == 200) {
                List<ABNResult> results = parseApiResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', results);
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'API request failed with status: ' + response.getStatusCode(), null);
            }
            
        } catch (CalloutException e) {
            System```apex
public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, String searchType) {
        try {
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate input based on search type
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Make API callout
            String endpoint = buildEndpoint(searchTerm, searchType);
            HttpResponse response = makeHttpCallout(endpoint);
            
            if (response.getStatusCode() == 200) {
                List<ABNResult> results = parseApiResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', results);
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'API request failed with status: ' + response.getStatusCode(), null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Network error occurred. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        switch on searchType {
            when 'abn' {
                return Pattern.matches('^\\d{11}$', cleanTerm);
            }
            when 'acn' {
                return Pattern.matches('^\\d{9}$', cleanTerm);
            }
            when 'name' {
                return searchTerm.length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static String buildEndpoint(String searchTerm, String searchType) {
        String encodedTerm = EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        String paramName;
        
        switch on searchType {
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
        
        return API_ENDPOINT + '?' + paramName + '=' + encodedTerm;
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
                        Map<String, Object> dataMap = (Map<String, Object>) item;
                        ABNResult result = new ABNResult();
                        
                        result.id = getString(dataMap, 'id');
                        result.ABN = getString(dataMap, 'ABN');
                        result.ABNStatus = getString(dataMap, 'ABNStatus');
                        result.EntityType = getString(dataMap, 'EntityType');
                        result.EntityName = getString(dataMap, 'EntityName');
                        result.GoodsServicesGST = getString(dataMap, 'GoodsServicesGST');
                        result.MainBusinessLocation = getString(dataMap, 'MainBusinessLocation');
                        
                        results.add(result);
                    }
                }
            }
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            throw new CalloutException('Failed to parse API response');
        }
        
        return results;
    }
    
    private static String getString(Map<String, Object> dataMap, String key) {
        Object value = dataMap.get(key);
        return value != null ? String.valueOf(value) : '';
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
