public with sharing class newabnLookupTestV2Controller {
    
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
            String validationError = validateSearchInput(searchTerm, searchType);
            if (String.isNotBlank(validationError)) {
                return new ResponseWrapper(false, validationError, null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(searchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response received from ABN service', null);
            }
            
            // Parse response
            Object parsedData = parseAPIResponse(apiResponse);
            
            if (parsedData == null) {
                return new ResponseWrapper(false, 'No matching results found', null);
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', parsedData);
            
        } catch (Exception e) {
            System.debug('ABN Search Error: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            
            String userMessage = 'An error occurred while searching. Please try again.';
            if (e instanceof CalloutException) {
                userMessage = 'Unable to connect to ABN service. Please check your connection and try again.';
            }
            
            return new ResponseWrapper(false, userMessage, null);
        }
    }
    
    private static String validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return 'Search term cannot be empty';
        }
        
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        switch on searchType {
            when 'abn' {
                if (!Pattern.matches('^\\d{11}$', cleanTerm)) {
                    return 'ABN must be exactly 11 digits';
                }
            }
            when 'acn' {
                if (!Pattern.matches('^\\d{9}$', cleanTerm)) {
                    return 'ACN must be exactly 9 digits';
                }
            }
            when 'name' {
                if (searchTerm.length() < 2) {
                    return 'Company name must be at least 2 characters';
                }
            }
            when else {
                return 'Invalid search type specified';
            }
        }
        
        return null;
    }
    
    private static String makeAPICall(String searchTerm, String searchType) {
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
                System.debug('ABN not found: ' + response.getStatusCode());
                return null;
            } else {
                throw new CalloutException('API returned status code: ' + response.getStatusCode() + 
                                         ' with message: ' + response.getStatus());
            }
            
        } catch (System.CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.debug('Unexpected error in API call: ' + e.getMessage());
            throw new CalloutException('Failed to connect to ABN service: ' + e.getMessage());
        }
    }
    
    private static String buildEndpoint(String searchTerm, String searchType) {
        String baseEndpoint = API_ENDPOINT;
        String queryParam = '';
        
        switch on searchType {
            when 'abn' {
                queryParam = '?abn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
            }
            when 'acn' {
                queryParam = '?acn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
            }
            when 'name' {
                queryParam = '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
        }
        
        return baseEndpoint + queryParam;
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
                        Map<String, Object> processedItem = processABNRecord((Map<String, Object>) item);
                        if (processedItem != null) {
                            resultList.add(processedItem);
                        }
                    }
                }
                
                return resultList.isEmpty() ? null : resultList;
                
            } else if (tempResult instanceof Map<String, Object>) {
                Map<String, Object> singleResult = (Map<String, Object>) tempResult;
                Map<String, Object> processedResult = processABNRecord(singleResult);
                return processedResult;
            }
            
            return null;
            
        } catch (JSONException e) {
            System.debug('JSON parsing error: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN service');
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            throw new AuraHandledException('Error processing ABN data');
        }
    }
    
    private static Map<String, Object> processABNRecord(Map<String, Object> record) {
        try {
            if (record == null || record.isEmpty()) {
                return null;
            }
            
            // Validate that this is a valid ABN record
            Map<String, Object> abnData = (Map<String, Object>) record.get('abn');
            if (abnData == null || String.isBlank((String) abnData.get('identifier_value'))) {
                return null;
            }
            
            // Return the processed record
            Map<String, Object> processedRecord = new Map<String, Object>();
            processedRecord.putAll(record);
            
            // Add any additional processing here if needed
            processedRecord.put('processed_timestamp', DateTime.now().getTime());
            
            return processedRecord;
            
        } catch (Exception e) {
            System.debug('Error processing ABN record: ' + e.getMessage());
            return null;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper getSearchHistory(String userId) {
        try {
            // This method can be implemented to return search history
            // For now, returning empty response
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
        @AuraEnabled public Long timestamp;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = new List<String>();
            this.timestamp = DateTime.now().getTime();
        }
        
        public ResponseWrapper(Boolean success, String message, Object data, List<String> errors) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = errors != null ? errors : new List<String>();
            this.timestamp = DateTime.now().getTime();
        }
    }
}
