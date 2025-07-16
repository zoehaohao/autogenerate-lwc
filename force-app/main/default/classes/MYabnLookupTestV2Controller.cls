public with sharing class MYabnLookupTestV2Controller {
    
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
                return new ResponseWrapper(false, 'Invalid search criteria', null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(sanitizedTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response from API', null);
            }
            
            // Parse and process response
            Object parsedData = parseAPIResponse(apiResponse);
            
            if (parsedData == null) {
                return new ResponseWrapper(false, 'No matching results found', null);
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', parsedData);
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
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
                return searchTerm.length() >= 2 && searchTerm.length() <= 200;
            }
            when else {
                return false;
            }
        }
    }
    
    private static String makeAPICall(String searchTerm, String searchType) {
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
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            return null; // No results found
        } else {
            throw new CalloutException('API returned status code: ' + response.getStatusCode());
        }
    }
    
    private static Object parseAPIResponse(String jsonResponse) {
        try {
            Object tempData = JSON.deserializeUntyped(jsonResponse);
            
            if (tempData == null) {
                return null;
            }
            
            // Handle both single object and array responses
            if (tempData instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempData;
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
            } else if (tempData instanceof Map<String, Object>) {
                Map<String, Object> dataMap = (Map<String, Object>) tempData;
                
                // Check if the response indicates no results
                if (dataMap.isEmpty() || isEmptyResult(dataMap)) {
                    return null;
                }
                
                return dataMap;
            }
            
            return null;
            
        } catch (JSONException e) {
            System.debug('JSON Parse Exception: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN service');
        }
    }
    
    private static Boolean isEmptyResult(Map<String, Object> dataMap) {
        // Check for common indicators of empty/invalid results
        Object abn = dataMap.get('abn');
        if (abn instanceof Map<String, Object>) {
            Map<String, Object> abnMap = (Map<String, Object>) abn;
            String identifierValue = (String) abnMap.get('identifier_value');
            if (String.isBlank(identifierValue)) {
                return true;
            }
        }
        
        Object entityStatus = dataMap.get('entity_status');
        if (entityStatus instanceof Map<String, Object>) {
            Map<String, Object> statusMap = (Map<String, Object>) entityStatus;
            String statusCode = (String) statusMap.get('entity_status_code');
            if (String.isBlank(statusCode)) {
                return true;
            }
        }
        
        return false;
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
