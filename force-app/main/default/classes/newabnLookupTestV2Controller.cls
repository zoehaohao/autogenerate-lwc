public with sharing class newabnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchData) {
        try {
            if (String.isBlank(searchData)) {
                return new ResponseWrapper(false, 'Search data is required', null);
            }
            
            Map<String, Object> searchParams = parseSearchData(searchData);
            if (searchParams == null) {
                return new ResponseWrapper(false, 'Invalid search data format', null);
            }
            
            String searchTerm = (String) searchParams.get('searchTerm');
            String searchType = (String) searchParams.get('searchType');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate input based on search type
            ValidationResult validation = validateSearchInput(searchTerm, searchType);
            if (!validation.isValid) {
                return new ResponseWrapper(false, validation.errorMessage, null);
            }
            
            // Make API call
            HttpResponse response = makeApiCall(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                Object responseData = parseApiResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', responseData);
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            } else {
                String errorMsg = 'API call failed with status: ' + response.getStatusCode();
                System.debug('API Error: ' + errorMsg + ' - Response: ' + response.getBody());
                return new ResponseWrapper(false, 'Search service temporarily unavailable. Please try again later.', null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to search service. Please check your connection and try again.', null);
        } catch (Exception e) {
            System.debug('Unexpected Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again later.', null);
        }
    }
    
    private static Map<String, Object> parseSearchData(String searchData) {
        try {
            Object tempData = JSON.deserializeUntyped(searchData);
            return (Map<String, Object>) tempData;
        } catch (Exception e) {
            System.debug('Error parsing search data: ' + e.getMessage());
            return null;
        }
    }
    
    private static ValidationResult validateSearchInput(String searchTerm, String searchType) {
        ValidationResult result = new ValidationResult();
        
        if (String.isBlank(searchTerm)) {
            result.isValid = false;
            result.errorMessage = 'Search term cannot be empty';
            return result;
        }
        
        String trimmedTerm = searchTerm.trim();
        
        // Sanitize input - remove potentially harmful characters
        String sanitizedTerm = sanitizeInput(trimmedTerm);
        if (sanitizedTerm != trimmedTerm) {
            result.isValid = false;
            result.errorMessage = 'Search term contains invalid characters';
            return result;
        }
        
        switch (searchType) {
            case 'ABN':
                if (!Pattern.matches('^\\d{11}$', trimmedTerm)) {
                    result.isValid = false;
                    result.errorMessage = 'ABN must be exactly 11 digits';
                    return result;
                }
                break;
            case 'ACN':
                if (!Pattern.matches('^\\d{9}$', trimmedTerm)) {
                    result.isValid = false;
                    result.errorMessage = 'ACN must be exactly 9 digits';
                    return result;
                }
                break;
            case 'NAME':
                if (trimmedTerm.length() < 2) {
                    result.isValid = false;
                    result.errorMessage = 'Company name must be at least 2 characters';
                    return result;
                }
                if (!Pattern.matches('^[a-zA-Z0-9\\s&.-]+$', trimmedTerm)) {
                    result.isValid = false;
                    result.errorMessage = 'Company name contains invalid characters';
                    return result;
                }
                break;
            default:
                result.isValid = false;
                result.errorMessage = 'Invalid search type';
                return result;
        }
        
        result.isValid = true;
        return result;
    }
    
    private static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return input;
        }
        
        // Remove potentially harmful characters while preserving valid business name characters
        return input.replaceAll('[<>"\'/\\\\]', '');
    }
    
    private static HttpResponse makeApiCall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = buildEndpointUrl(searchTerm, searchType);
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        System.debug('Making API call to: ' + endpoint);
        
        HttpResponse response = http.send(request);
        
        System.debug('API Response Status: ' + response.getStatusCode());
        System.debug('API Response Body: ' + response.getBody());
        
        return response;
    }
    
    private static String buildEndpointUrl(String searchTerm, String searchType) {
        String baseUrl = API_ENDPOINT;
        String queryParam = '';
        
        switch (searchType) {
            case 'ABN':
                queryParam = '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
            case 'ACN':
                queryParam = '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
            case 'NAME':
                queryParam = '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
        }
        
        return baseUrl + queryParam;
    }
    
    private static Object parseApiResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return new List<Object>();
            }
            
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            // Handle both single object and array responses
            if (tempResult instanceof List<Object>) {
                return tempResult;
            } else {
                // Single result - wrap in array for consistent handling
                List<Object> resultList = new List<Object>();
                resultList.add(tempResult);
                return resultList;
            }
            
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from search service');
        }
    }
    
    // Helper classes
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
    
    private class ValidationResult {
        public Boolean isValid = false;
        public String errorMessage = '';
    }
}
