public with sharing class ABNLookupCompController {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, String searchType) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Sanitize input
            String sanitizedTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Validate search type and term format
            if (!validateSearchInput(sanitizedTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Make API call
            HttpResponse response = makeAPICall(sanitizedTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                // Parse response safely
                Object responseData = parseAPIResponse(response.getBody());
                
                if (responseData != null) {
                    return new ResponseWrapper(true, 'Search completed successfully', responseData);
                } else {
                    return new ResponseWrapper(false, 'No results found', null);
                }
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(false, 'No matching results found', null);
            } else {
                System.debug('API Error - Status: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'Search service temporarily unavailable', null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to search service', null);
        } catch (Exception e) {
            System.debug('Unexpected Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred', null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
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
    
    private static HttpResponse makeAPICall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
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
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        return http.send(request);
    }
    
    private static Object parseAPIResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return null;
            }
            
            // Safe JSON parsing
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
                return (Map<String, Object>) tempResult;
            }
            
            return tempResult;
            
        } catch (JSONException e) {
            System.debug('JSON Parse Error: ' + e.getMessage());
            return null;
        } catch (Exception e) {
            System.debug('Parse Error: ' + e.getMessage());
            return null;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper getABNDetails(String abnNumber) {
        try {
            if (String.isBlank(abnNumber)) {
                return new ResponseWrapper(false, 'ABN number is required', null);
            }
            
            String sanitizedABN = String.escapeSingleQuotes(abnNumber.trim());
            
            if (!Pattern.matches('^\\d{11}$', sanitizedABN)) {
                return new ResponseWrapper(false, 'Invalid ABN format', null);
            }
            
            HttpResponse response = makeAPICall(sanitizedABN, 'ABN');
            
            if (response.getStatusCode() == 200) {
                Object responseData = parseAPIResponse(response.getBody());
                return new ResponseWrapper(true, 'ABN details retrieved successfully', responseData);
            } else {
                return new ResponseWrapper(false, 'ABN not found', null);
            }
            
        } catch (Exception e) {
            System.debug('Get ABN Details Error: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to retrieve ABN details', null);
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
}
