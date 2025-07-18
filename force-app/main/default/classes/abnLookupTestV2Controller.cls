public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchAbnEntities(String searchTerm, Integer pageSize, Integer pageNumber) {
        try {
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Determine search parameter based on input
            String searchParam = determineSearchParameter(searchTerm.trim());
            Object searchResults = callAbnApi(searchParam, searchTerm.trim());
            
            if (searchResults != null) {
                return new ResponseWrapper(true, 'Search completed successfully', searchResults);
            } else {
                return new ResponseWrapper(false, 'No results found', null);
            }
            
        } catch (Exception e) {
            System.debug('Search error: ' + e.getMessage());
            return new ResponseWrapper(false, 'An error occurred while searching: ' + e.getMessage(), null);
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper verifyAbnEntity(String abnOrAcn) {
        try {
            if (String.isBlank(abnOrAcn)) {
                return new ResponseWrapper(false, 'ABN or ACN is required', null);
            }
            
            String cleanInput = abnOrAcn.trim().replaceAll('\\s+', '');
            
            // Validate input format
            if (!Pattern.matches('^\\d+$', cleanInput)) {
                return new ResponseWrapper(false, 'Invalid format. Please enter numbers only.', null);
            }
            
            if (cleanInput.length() != 11 && cleanInput.length() != 9) {
                return new ResponseWrapper(false, 'An ABN requires 11 digits and an ACN requires 9 digits', null);
            }
            
            Object verifyResult = callAbnApi('abn', cleanInput);
            
            if (verifyResult != null) {
                return new ResponseWrapper(true, 'Verification completed successfully', verifyResult);
            } else {
                return new ResponseWrapper(false, 'No matching entity found', null);
            }
            
        } catch (Exception e) {
            System.debug('Verify error: ' + e.getMessage());
            return new ResponseWrapper(false, 'An error occurred while verifying: ' + e.getMessage(), null);
        }
    }
    
    private static String determineSearchParameter(String searchTerm) {
        // Remove spaces and check if numeric
        String cleanTerm = searchTerm.replaceAll('\\s+', '');
        
        if (Pattern.matches('^\\d+$', cleanTerm)) {
            if (cleanTerm.length() == 11) {
                return 'abn';
            } else if (cleanTerm.length() == 9) {
                return 'acn';
            }
        }
        
        // Default to name search for non-numeric or invalid length numeric inputs
        return 'name';
    }
    
    private static Object callAbnApi(String paramType, String paramValue) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build URL with query parameter
            String endpoint = API_ENDPOINT;
            if (paramType == 'abn') {
                endpoint += '?abn=' + EncodingUtil.urlEncode(paramValue, 'UTF-8');
            } else if (paramType == 'acn') {
                endpoint += '?acn=' + EncodingUtil.urlEncode(paramValue, 'UTF-8');
            } else {
                endpoint += '?name=' + EncodingUtil.urlEncode(paramValue, 'UTF-8');
            }
            
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                String responseBody = response.getBody();
                if (String.isNotBlank(responseBody)) {
                    Object parsedResponse = JSON.deserializeUntyped(responseBody);
                    return parsedResponse;
                }
            } else if (response.getStatusCode() == 404) {
                // No results found - this is a valid scenario
                return null;
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                throw new CalloutException('API returned error status: ' + response.getStatusCode());
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.debug('General Exception in API call: ' + e.getMessage());
            throw new CalloutException('Failed to connect to ABN service: ' + e.getMessage());
        }
        
        return null;
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
