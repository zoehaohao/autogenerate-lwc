public with sharing class MyabnLookupTestV2Controller {
    
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
                return new ResponseWrapper(false, 'Invalid search criteria for ' + searchType, null);
            }
            
            // Perform API callout
            String apiResponse = performAPICallout(searchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response received from ABN service', null);
            }
            
            // Parse and process response
            Object parsedResponse = parseAPIResponse(apiResponse);
            
            if (parsedResponse == null) {
                return new ResponseWrapper(false, 'No matching results found', null);
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', parsedResponse);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An error occurred while searching: ' + e.getMessage(), null);
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
    
    private static String performAPICallout(String searchTerm, String searchType) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameters
            String endpoint = buildEndpoint(searchTerm, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return response.getBody();
            } else if (response.getStatusCode() == 404) {
                System.debug('No results found for search term: ' + searchTerm);
                return null;
            } else {
                throw new CalloutException('HTTP Error: ' + response.getStatusCode() + ' - ' + response.getStatus());
            }
            
        } catch (System.CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            throw new AuraHandledException('Unable to connect to ABN service. Please try again later.');
        } catch (Exception e) {
            System.debug('Unexpected error during API callout: ' + e.getMessage());
            throw new AuraHandledException('An unexpected error occurred during the search.');
        }
    }
    
    private static String buildEndpoint(String searchTerm, String searchType) {
        String endpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
        switch on searchType {
            when 'abn' {
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
            }
            when 'acn' {
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
            }
            when 'name' {
                endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
            }
        }
        
        return endpoint;
    }
    
    private static Object parseAPIResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return null;
            }
            
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            if (tempResult == null) {
                return null;
            }
            
            // Handle both single object and array responses
            if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                if (tempList.isEmpty()) {
                    return null;
                }
                
                List<Map<String, Object>> resultList = new List<Map<String, Object>>();
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        resultList.add((Map<String, Object>) item);
                    }
                }
                return resultList;
            } else if (tempResult instanceof Map<String, Object>) {
                Map<String, Object> resultMap = (Map<String, Object>) tempResult;
                
                // Check if the response indicates no results
                if (resultMap.isEmpty() || isEmptyResult(resultMap)) {
                    return null;
                }
                
                return resultMap;
            }
            
            return null;
            
        } catch (JSONException e) {
            System.debug('JSON parsing error: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format received from ABN service.');
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            throw new AuraHandledException('Error processing search results.');
        }
    }
    
    private static Boolean isEmptyResult(Map<String, Object> result) {
        // Check if essential fields are missing or empty
        Map<String, Object> abnInfo = (Map<String, Object>) result.get('abn');
        if (abnInfo == null) {
            return true;
        }
        
        String abnNumber = (String) abnInfo.get('identifier_value');
        return String.isBlank(abnNumber);
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
    
    // Exception classes
    public class CalloutException extends Exception {}
}
