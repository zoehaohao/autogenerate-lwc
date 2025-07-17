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
            
            // Sanitize input
            searchTerm = sanitizeInput(searchTerm);
            
            // Make API call
            String apiResponse = makeAPICall(searchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response from API', null);
            }
            
            // Parse response
            Object parsedData = parseAPIResponse(apiResponse);
            
            if (parsedData == null) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', parsedData);
            
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
        
        String cleanTerm = searchTerm.replaceAll('\\s+', '');
        
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
    
    private static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        // Remove potentially harmful characters
        return input.replaceAll('[<>"\']', '').trim();
    }
    
    private static String makeAPICall(String searchTerm, String searchType) {
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
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            return ''; // No results found
        } else {
            throw new CalloutException('API returned status code: ' + response.getStatusCode());
        }
    }
    
    private static String buildQueryParameter(String searchTerm, String searchType) {
        switch on searchType {
            when 'abn' {
                return 'abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'acn' {
                return 'acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'name' {
                return 'name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when else {
                return '';
            }
        }
    }
    
    private static Object parseAPIResponse(String apiResponse) {
        try {
            Object tempData = JSON.deserializeUntyped(apiResponse);
            
            if (tempData == null) {
                return null;
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
                
                return resultList.isEmpty() ? null : resultList;
            } else if (tempData instanceof Map<String, Object>) {
                Map<String, Object> singleResult = (Map<String, Object>) tempData;
                return singleResult.isEmpty() ? null : singleResult;
            }
            
            return null;
            
        } catch (JSONException e) {
            System.debug('JSON parsing error: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN service');
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
}
