public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            if (String.isBlank(searchParams)) {
                return new ResponseWrapper(false, 'Search parameters are required', null);
            }
            
            Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(searchParams);
            String searchValue = (String) params.get('searchValue');
            String searchType = (String) params.get('searchType');
            
            if (String.isBlank(searchValue)) {
                return new ResponseWrapper(false, 'Search value is required', null);
            }
            
            // Sanitize input
            searchValue = String.escapeSingleQuotes(searchValue.trim());
            
            // Validate input based on search type
            if (!validateSearchInput(searchValue, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Make API call
            List<ABNResult> results = performABNSearch(searchValue, searchType);
            
            return new ResponseWrapper(true, 'Search completed successfully',results);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            return new ResponseWrapper(false, 'An error occurred while searching: ' + e.getMessage(), null);
        }
    }
    
    private static Boolean validateSearchInput(String searchValue, String searchType) {
        if (String.isBlank(searchValue) || String.isBlank(searchType)) {
            return false;
        }
        
        switch on searchType {
            when 'ABN' {
                return Pattern.matches('^\\d{11}$', searchValue);
            }
            when 'ACN' {
                return Pattern.matches('^\\d{9}$', searchValue);
            }
            when 'COMPANY' {
                return searchValue.length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static List<ABNResult> performABNSearch(String searchValue, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT + '?';
        switch on searchType {
            when 'ABN' {
                endpoint += 'abn=' + EncodingUtil.urlEncode(searchValue, 'UTF-8');
            }
            when 'ACN' {
                endpoint += 'acn=' + EncodingUtil.urlEncode(searchValue, 'UTF-8');
            }
            when 'COMPANY' {
                endpoint += 'name=' + EncodingUtil.urlEncode(searchValue, 'UTF-8');
            }
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        try {
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return parseABNResponse(response.getBody());
            } else {
                throw new CalloutException('API returned status code: ' + response.getStatusCode());
            }
            
        } catch (CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            throw new AuraHandledException('Unable to connect to ABN service. Please try again later.');
        }
    }
    
    private static List<ABNResult> parseABNResponse(String responseBody) {
        List<ABNResult> results = new List<ABNResult>();
        
        try {
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> resultMap = (Map<String, Object>) item;
                        ABNResult abnResult = new ABNResult();
                        
                        abnResult.id = getString(resultMap, 'id');
                        abnResult.ABN = getString(resultMap, 'ABN');
                        abnResult.ABNStatus = getString(resultMap, 'ABNStatus');
                        abnResult.EntityType = getString(resultMap, 'EntityType');
                        abnResult.EntityName = getString(resultMap, 'EntityName');
                        abnResult.GoodsServicesGST = getString(resultMap, 'GoodsServicesGST');
                        abnResult.MainBusinessLocation = getString(resultMap, 'MainBusinessLocation');
                        
                        results.add(abnResult);
                    }
                }
            }
            
        } catch (Exception e) {
            System.debug('Error parsing response: ' + e.getMessage());
            throw new AuraHandledException('Error processing search results');
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
    }
}
