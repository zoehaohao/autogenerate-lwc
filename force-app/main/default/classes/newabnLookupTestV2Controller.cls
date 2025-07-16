public with sharing class newabnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            if (String.isBlank(searchParams)) {
                return new ResponseWrapper(false, 'Search parameters are required', null);
            }
            
            Map<String, Object> params = parseSearchParams(searchParams);
            if (params == null) {
                return new ResponseWrapper(false, 'Invalid search parameters', null);
            }
            
            String searchTerm = (String) params.get('searchTerm');
            String searchType = (String) params.get('searchType');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate search term based on type
            if (!validateSearchTerm(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search term format', null);
            }
            
            // Make API call
            Object apiResponse = makeAPICall(searchTerm, searchType);
            
            if (apiResponse == null) {
                return new ResponseWrapper(false, 'No results found', null);
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', apiResponse);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An error occurred while searching: ' + e.getMessage(), null);
        }
    }
    
    private static Map<String, Object> parseSearchParams(String searchParams) {
        try {
            Object tempData = JSON.deserializeUntyped(searchParams);
            return (Map<String, Object>) tempData;
        } catch (Exception e) {
            System.debug('Error parsing search parameters: ' + e.getMessage());
            return null;
        }
    }
    
    private static Boolean validateSearchTerm(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String trimmedTerm = searchTerm.trim();
        
        switch on searchType {
            when 'abn' {
                // Validate 11-digit ABN
                return Pattern.matches('^\\d{11}$', trimmedTerm);
            }
            when 'acn' {
                // Validate 9-digit ACN
                return Pattern.matches('^\\d{9}$', trimmedTerm);
            }
            when 'name' {
                // Validate minimum 2 characters for company name
                return trimmedTerm.length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static Object makeAPICall(String searchTerm, String searchType) {
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
                String responseBody = response.getBody();
                if (String.isNotBlank(responseBody)) {
                    return parseAPIResponse(responseBody);
                }
            } else if (response.getStatusCode() == 404) {
                // No results found - return null for proper handling
                return null;
            } else {
                throw new CalloutException('API call failed with status: ' + response.getStatusCode() + ' - ' + response.getStatus());
            }
            
            return null;
            
        } catch (System.CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            throw new AuraHandledException('Unable to connect to ABN lookup service. Please try again later.');
        } catch (Exception e) {
            System.debug('API call error: ' + e.getMessage());
            throw new AuraHandledException('An error occurred while searching for ABN information.');
        }
    }
    
    private static String buildEndpoint(String searchTerm, String searchType) {
        String endpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
        switch on searchType {
            when 'abn' {
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'acn' {
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'name' {
                endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
        }
        
        return endpoint;
    }
    
    private static Object parseAPIResponse(String responseBody) {
        try {
            Object tempResponse = JSON.deserializeUntyped(responseBody);
            
            // Handle both single result and array of results
            if (tempResponse instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResponse;
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        results.add((Map<String, Object>) item);
                    }
                }
                
                return results;
            } else if (tempResponse instanceof Map<String, Object>) {
                return (Map<String, Object>) tempResponse;
            }
            
            return tempResponse;
            
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN lookup service.');
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper getComponentConfiguration() {
        try {
            Map<String, Object> config = new Map<String, Object>{
                'apiEndpoint' => API_ENDPOINT,
                'timeoutSeconds' => TIMEOUT_SECONDS,
                'supportedSearchTypes' => new List<String>{'abn', 'acn', 'name'},
                'validationRules' => new Map<String, Object>{
                    'abn' => new Map<String, String>{
                        'pattern' => '^\\d{11}$',
                        'message' => 'ABN must be 11 digits'
                    },
                    'acn' => new Map<String, String>{
                        'pattern' => '^\\d{9}$',
                        'message' => 'ACN must be 9 digits'
                    },
                    'name' => new Map<String, String>{
                        'minLength' => '2',
                        'message' => 'Company name must be at least 2 characters'
                    }
                }
            };
            
            return new ResponseWrapper(true, 'Configuration retrieved successfully', config);
            
        } catch (Exception e) {
            System.debug('Error getting configuration: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to retrieve configuration', null);
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
            this.timestamp = DateTime.now().formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        }
        
        public ResponseWrapper(Boolean success, String message, Object data, List<String> errors) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = errors != null ? errors : new List<String>();
            this.timestamp = DateTime.now().formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        }
    }
}
