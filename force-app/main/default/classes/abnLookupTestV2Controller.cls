public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchAbnEntities(String searchTerm, Integer pageSize, Integer pageNumber) {
        try {
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Determine search type and build parameters
            Map<String, String> queryParams = buildSearchParams(searchTerm);
            
            // Make API call
            HttpResponse response = makeApiCall(queryParams);
            
            if (response.getStatusCode() == 200) {
                Object responseData = JSON.deserializeUntyped(response.getBody());
                List<Object> entities = new List<Object>();
                
                // Handle different response structures
                if (responseData instanceof List<Object>) {
                    List<Object> tempList = (List<Object>) responseData;
                    for (Object item : tempList) {
                        entities.add(item);
                    }
                } else if (responseData instanceof Map<String, Object>) {
                    entities.add(responseData);
                }
                
                // Apply pagination
                Integer totalCount = entities.size();
                Integer startIndex = (pageNumber - 1) * pageSize;
                Integer endIndex = Math.min(startIndex + pageSize, totalCount);
                
                List<Object> paginatedEntities = new List<Object>();
                for (Integer i = startIndex; i < endIndex; i++) {
                    paginatedEntities.add(entities[i]);
                }
                
                Map<String, Object> resultData = new Map<String, Object>{
                    'entities' => paginatedEntities,
                    'totalCount' => totalCount,
                    'currentPage' => pageNumber,
                    'pageSize' => pageSize
                };
                
                return new ResponseWrapper(true, 'Search completed successfully', resultData);
            } else {
                System.debug('API Error - Status: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'External service error: ' + response.getStatus(), null);
            }
            
        } catch (Exception e) {
            System.debug('Search error: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An error occurred during search: ' + e.getMessage(), null);
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper verifyAbnEntity(String abnOrAcn) {
        try {
            if (String.isBlank(abnOrAcn)) {
                return new ResponseWrapper(false, 'ABN or ACN is required', null);
            }
            
            // Clean input
            String cleanInput = abnOrAcn.replaceAll('\\s', '');
            
            // Validate format
            if (!Pattern.matches('^\\d{9}$|^\\d{11}$', cleanInput)) {
                return new ResponseWrapper(false, 'Invalid ABN or ACN format', null);
            }
            
            // Build query parameters
            Map<String, String> queryParams = new Map<String, String>();
            if (cleanInput.length() == 11) {
                queryParams.put('abn', cleanInput);
            } else {
                queryParams.put('acn', cleanInput);
            }
            
            // Make API call
            HttpResponse response = makeApiCall(queryParams);
            
            if (response.getStatusCode() == 200) {
                Object responseData = JSON.deserializeUntyped(response.getBody());
                List<Object> entities = new List<Object>();
                
                if (responseData instanceof Map<String, Object>) {
                    entities.add(responseData);
                } else if (responseData instanceof List<Object>) {
                    List<Object> tempList = (List<Object>) responseData;
                    for (Object item : tempList) {
                        entities.add(item);
                    }
                }
                
                Map<String, Object> resultData = new Map<String, Object>{
                    'entities' => entities,
                    'totalCount' => entities.size(),
                    'currentPage' => 1,
                    'pageSize' => entities.size()
                };
                
                return new ResponseWrapper(true, 'Verification completed successfully', resultData);
            } else {
                System.debug('API Error - Status: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'External service error: ' + response.getStatus(), null);
            }
            
        } catch (Exception e) {
            System.debug('Verify error: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An error occurred during verification: ' + e.getMessage(), null);
        }
    }
    
    private static Map<String, String> buildSearchParams(String searchTerm) {
        Map<String, String> params = new Map<String, String>();
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        // Check if it's a number (ABN or ACN)
        if (Pattern.matches('^\\d+$', cleanTerm)) {
            if (cleanTerm.length() == 11) {
                params.put('abn', cleanTerm);
            } else if (cleanTerm.length() == 9) {
                params.put('acn', cleanTerm);
            } else {
                // For invalid numeric inputs, still try ABN search
                params.put('abn', cleanTerm);
            }
        } else {
            // Business name search
            params.put('name', searchTerm);
        }
        
        return params;
    }
    
    private static HttpResponse makeApiCall(Map<String, String> queryParams) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build URL with query parameters
        String url = API_ENDPOINT;
        if (!queryParams.isEmpty()) {
            List<String> paramList = new List<String>();
            for (String key : queryParams.keySet()) {
                paramList.add(key + '=' + EncodingUtil.urlEncode(queryParams.get(key), 'UTF-8'));
            }
            url += '?' + String.join(paramList, '&');
        }
        
        request.setEndpoint(url);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        System.debug('Making API call to: ' + url);
        
        HttpResponse response = http.send(request);
        System.debug('API Response Status: ' + response.getStatusCode());
        System.debug('API Response Body: ' + response.getBody());
        
        return response;
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
