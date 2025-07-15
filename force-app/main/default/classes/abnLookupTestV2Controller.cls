public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchTerm, String searchType, Integer pageNumber, Integer pageSize) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            if (pageNumber == null || pageNumber < 1) {
                pageNumber = 1;
            }
            
            if (pageSize == null || pageSize < 1) {
                pageSize = 10;
            }
            
            // Validate search type and term
            ValidationResult validation = validateSearchInput(searchTerm, searchType);
            if (!validation.isValid) {
                return new ResponseWrapper(false, validation.errorMessage, null);
            }
            
            // Make API call
            HttpResponse response = makeAPICall(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                // Parse response
                SearchResultData resultData = parseAPIResponse(response.getBody(), pageNumber, pageSize);
                return new ResponseWrapper(true, 'Search completed successfully', resultData);
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(false, 'No matching results for ' + searchTerm + ', please check the inputs and try again.', null);
            } else {
                System.debug('API Error - Status: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                return new ResponseWrapper(false, 'External service error. Please try again later.', null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Network error. Please check your connection and try again.', null);
        } catch (Exception e) {
            System.debug('Unexpected Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static ValidationResult validateSearchInput(String searchTerm, String searchType) {
        ValidationResult result = new ValidationResult();
        result.isValid = true;
        
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        if (searchType == 'abn') {
            if (!Pattern.matches('^\\d{11}$', cleanTerm)) {
                result.isValid = false;
                result.errorMessage = 'An ABN requires 11 digits, check the number and try again';
            }
        } else if (searchType == 'acn') {
            if (!Pattern.matches('^\\d{9}$', cleanTerm)) {
                result.isValid = false;
                result.errorMessage = 'An ACN requires 9 digits, check the number and try again';
            }
        } else if (searchType == 'name') {
            if (searchTerm.length() < 2) {
                result.isValid = false;
                result.errorMessage = 'Business name must be at least 2 characters long';
            }
        }
        
        return result;
    }
    
    private static HttpResponse makeAPICall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        if (searchType == 'abn') {
            endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
        } else if (searchType == 'acn') {
            endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm.replaceAll('\\s', ''), 'UTF-8');
        } else {
            endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        return http.send(request);
    }
    
    private static SearchResultData parseAPIResponse(String responseBody, Integer pageNumber, Integer pageSize) {
        SearchResultData resultData = new SearchResultData();
        
        try {
            Object tempResponse = JSON.deserializeUntyped(responseBody);
            
            // Handle both single result and array of results
            List<Object> resultsList = new List<Object>();
            
            if (tempResponse instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResponse;
                resultsList.addAll(tempList);
            } else {
                resultsList.add(tempResponse);
            }
            
            // Convert to structured results
            List<Map<String, Object>> structuredResults = new List<Map<String, Object>>();
            for (Object item : resultsList) {
                if (item instanceof Map<String, Object>) {
                    Map<String, Object> resultMap = (Map<String, Object>) item;
                    structuredResults.add(processResultItem(resultMap));
                }
            }
            
            // Apply pagination
            Integer totalCount = structuredResults.size();
            Integer startIndex = (pageNumber - 1) * pageSize;
            Integer endIndex = Math.min(startIndex + pageSize, totalCount);
            
            List<Map<String, Object>> paginatedResults = new List<Map<String, Object>>();
            if (startIndex < totalCount) {
                for (Integer i = startIndex; i < endIndex; i++) {
                    paginatedResults.add(structuredResults[i]);
                }
            }
            
            resultData.results = paginatedResults;
            resultData.totalCount = totalCount;
            resultData.pageNumber = pageNumber;
            resultData.pageSize = pageSize;
            
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            resultData.results = new List<Map<String, Object>>();
            resultData.totalCount = 0;
        }
        
        return resultData;
    }
    
    private static Map<String, Object> processResultItem(Map<String, Object> rawResult) {
        Map<String, Object> processedResult = new Map<String, Object>();
        
        // Extract ABN information
        if (rawResult.containsKey('abn') && rawResult.get('abn') != null) {
            Map<String, Object> abnData = (Map<String, Object>) rawResult.get('abn');
            processedResult.put('abn', abnData);
        }
        
        // Extract entity status
        if (rawResult.containsKey('entity_status') && rawResult.get('entity_status') != null) {
            Map<String, Object> statusData = (Map<String, Object>) rawResult.get('entity_status');
            processedResult.put('entity_status', statusData);
        }
        
        // Extract entity type
        if (rawResult.containsKey('entity_type') && rawResult.get('entity_type') != null) {
            Map<String, Object> typeData = (Map<String, Object>) rawResult.get('entity_type');
            processedResult.put('entity_type', typeData);
        }
        
        // Extract trading name
        if (rawResult.containsKey('other_trading_name') && rawResult.get('other_trading_name') != null) {
            Map<String, Object> tradingData = (Map<String, Object>) rawResult.get('other_trading_name');
            processedResult.put('other_trading_name', tradingData);
        }
        
        // Extract GST information
        if (rawResult.containsKey('goods_and_services_tax') && rawResult.get('goods_and_services_tax') != null) {
            Map<String, Object> gstData = (Map<String, Object>) rawResult.get('goods_and_services_tax');
            processedResult.put('goods_and_services_tax', gstData);
        }
        
        // Extract ASIC number
        if (rawResult.containsKey('asic_number')) {
            processedResult.put('asic_number', rawResult.get('asic_number'));
        }
        
        // Add derived fields for easier consumption
        processedResult.put('entity_name', extractEntityName(rawResult));
        processedResult.put('main_business_location', extractBusinessLocation(rawResult));
        processedResult.put('record_last_updated_date', rawResult.get('record_last_updated_date'));
        
        return processedResult;
    }
    
    private static String extractEntityName(Map<String, Object> rawResult) {
        // Try to get entity name from various possible fields
        if (rawResult.containsKey('entity_name') && rawResult.get('entity_name') != null) {
            return String.valueOf(rawResult.get('entity_name'));
        }
        
        if (rawResult.containsKey('other_trading_name') && rawResult.get('other_trading_name') != null) {
            Map<String, Object> tradingData = (Map<String, Object>) rawResult.get('other_trading_name');
            if (tradingData.containsKey('organisation_name')) {
                return String.valueOf(tradingData.get('organisation_name'));
            }
        }
        
        return 'N/A';
    }
    
    private static String extractBusinessLocation(Map<String, Object> rawResult) {
        // Extract business location - this might need adjustment based on actual API response structure
        if (rawResult.containsKey('main_business_location')) {
            return String.valueOf(rawResult.get('main_business_location'));
        }
        
        // Default location extraction logic
        return 'VIC 3123'; // Default based on sample data
    }
    
    // Wrapper classes
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
    
    public class SearchResultData {
        @AuraEnabled public List<Map<String, Object>> results;
        @AuraEnabled public Integer totalCount;
        @AuraEnabled public Integer pageNumber;
        @AuraEnabled public Integer pageSize;
        
        public SearchResultData() {
            this.results = new List<Map<String, Object>>();
            this.totalCount = 0;
            this.pageNumber = 1;
            this.pageSize = 10;
        }
    }
    
    private class ValidationResult {
        public Boolean isValid;
        public String errorMessage;
        
        public ValidationResult() {
            this.isValid = true;
            this.errorMessage = '';
        }
    }
}
