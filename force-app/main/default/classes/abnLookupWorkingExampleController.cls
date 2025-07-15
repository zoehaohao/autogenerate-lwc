public with sharing class abnLookupWorkingExampleController {
    
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
            
            // Validate search term based on type
            if (!validateSearchTerm(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search term format', null);
            }
            
            // Perform API callout
            HttpResponse response = performAPICallout(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                Object responseData = JSON.deserializeUntyped(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', responseData);
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            } else {
                return new ResponseWrapper(false, 'API returned error: ' + response.getStatus(), null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred: ' + e.getMessage(), null);
        }
    }
    
    private static Boolean validateSearchTerm(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String cleanTerm = searchTerm.trim();
        
        switch on searchType {
            when 'abn' {
                // Validate 11-digit ABN
                return Pattern.matches('^\\d{11}$', cleanTerm);
            }
            when 'acn' {
                // Validate 9-digit ACN
                return Pattern.matches('^\\d{9}$', cleanTerm);
            }
            when 'name' {
                // Validate company name (minimum 2 characters)
                return cleanTerm.length() >= 2;
            }
            when else {
                return false;
            }
        }
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
        
        System.debug('API Endpoint: ' + endpoint);
        
        HttpResponse response = http.send(request);
        
        System.debug('API Response Status: ' + response.getStatusCode());
        System.debug('API Response Body: ' + response.getBody());
        
        return response;
    }
    
    private static String buildEndpointWithParams(String searchTerm, String searchType) {
        String endpoint = API_ENDPOINT;
        List<String> queryParams = new List<String>();
        
        switch on searchType {
            when 'abn' {
                queryParams.add('abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            }
            when 'acn' {
                // For ACN searches, we might need to use a different parameter
                // Based on the API documentation, using 'abn' parameter for now
                queryParams.add('abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            }
            when 'name' {
                queryParams.add('name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            }
        }
        
        if (!queryParams.isEmpty()) {
            endpoint += '?' + String.join(queryParams, '&');
        }
        
        return endpoint;
    }
    
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper getSearchHistory(String userId) {
        try {
            // This method could be implemented to return search history
            // For now, returning empty list
            return new ResponseWrapper(true, 'Search history retrieved', new List<Object>());
        } catch (Exception e) {
            System.debug('Error retrieving search history: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to retrieve search history', null);
        }
    }
    
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
    
    // Utility class for search parameters
    public class SearchParams {
        @AuraEnabled public String searchTerm;
        @AuraEnabled public String searchType;
        @AuraEnabled public Integer maxResults;
        
        public SearchParams() {
            this.maxResults = 50; // Default max results
        }
    }
    
    // Utility class for formatted results
    public class ABNSearchResult {
        @AuraEnabled public String entityName;
        @AuraEnabled public String abnNumber;
        @AuraEnabled public String abnStatus;
        @AuraEnabled public String entityType;
        @AuraEnabled public String gstStatus;
        @AuraEnabled public String asicNumber;
        @AuraEnabled public String mainBusinessLocation;
        @AuraEnabled public String lastUpdated;
        @AuraEnabled public Map<String, Object> rawData;
    }
}
