public with sharing class MyabnLookupTestV2Controller {
    
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
            String sanitizedSearchTerm = sanitizeInput(searchTerm.trim());
            
            // Validate search term based on type
            if (!validateSearchTerm(sanitizedSearchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search term format', null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(sanitizedSearchTerm, searchType);
            
            // Parse response
            Object parsedData = parseAPIResponse(apiResponse);
            
            // Process and format data
            List<Map<String, Object>> formattedResults = formatSearchResults(parsedData);
            
            if (formattedResults.isEmpty()) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', formattedResults);
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        // Remove potentially harmful characters but keep alphanumeric, spaces, and common business name characters
        return input.replaceAll('[^a-zA-Z0-9\\s&.\\-]', '');
    }
    
    private static Boolean validateSearchTerm(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        switch (searchType) {
            case 'ABN':
                return Pattern.matches('^\\d{11}$', searchTerm);
            case 'ACN':
                return Pattern.matches('^\\d{9}$', searchTerm);
            case 'NAME':
                return searchTerm.length() >= 2 && searchTerm.length() <= 200;
            default:
                return false;
        }
    }
    
    private static String makeAPICall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT + buildQueryParameters(searchTerm, searchType);
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            throw new CalloutException('No results found for the search criteria');
        } else {
            throw new CalloutException('API returned status code: ' + response.getStatusCode());
        }
    }
    
    private static String buildQueryParameters(String searchTerm, String searchType) {
        String encodedSearchTerm = EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        
        switch (searchType) {
            case 'ABN':
                return '?abn=' + encodedSearchTerm;
            case 'ACN':
                return '?acn=' + encodedSearchTerm;
            case 'NAME':
                return '?name=' + encodedSearchTerm;
            default:
                return '?q=' + encodedSearchTerm;
        }
    }
    
    private static Object parseAPIResponse(String jsonResponse) {
        if (String.isBlank(jsonResponse)) {
            throw new CalloutException('Empty response from API');
        }
        
        try {
            Object tempData = JSON.deserializeUntyped(jsonResponse);
            return tempData;
        } catch (JSONException e) {
            System.debug('JSON Parse Error: ' + e.getMessage());
            throw new CalloutException('Invalid response format from API');
        }
    }
    
    private static List<Map<String, Object>> formatSearchResults(Object apiData) {
        List<Map<String, Object>> formattedResults = new List<Map<String, Object>>();
        
        try {
            if (apiData == null) {
                return formattedResults;
            }
            
            // Handle single result
            if (apiData instanceof Map<String, Object>) {
                Map<String, Object> singleResult = (Map<String, Object>) apiData;
                Map<String, Object> formatted = formatSingleResult(singleResult);
                if (formatted != null) {
                    formattedResults.add(formatted);
                }
            }
            // Handle array of results
            else if (apiData instanceof List<Object>) {
                List<Object> tempList = (List<Object>) apiData;
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> resultItem = (Map<String, Object>) item;
                        Map<String, Object> formatted = formatSingleResult(resultItem);
                        if (formatted != null) {
                            formattedResults.add(formatted);
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            System.debug('Error formatting results: ' + e.getMessage());
        }
        
        return formattedResults;
    }
    
    private static Map<String, Object> formatSingleResult(Map<String, Object> rawResult) {
        if (rawResult == null) {
            return null;
        }
        
        Map<String, Object> formatted = new Map<String, Object>();
        
        try {
            // Extract ABN information
            Map<String, Object> abnData = (Map<String, Object>) rawResult.get('abn');
            if (abnData != null) {
                formatted.put('abnNumber', abnData.get('identifier_value'));
            }
            
            // Extract entity status
            Map<String, Object> entityStatus = (Map<String, Object>) rawResult.get('entity_status');
            if (entityStatus != null) {
                String status = (String) entityStatus.get('entity_status_code');
                String effectiveFrom = (String) entityStatus.get('effective_from');
                if (String.isNotBlank(status) && String.isNotBlank(effectiveFrom)) {
                    formatted.put('abnStatus', status + ' from ' + formatDate(effectiveFrom));
                } else {
                    formatted.put('abnStatus', status);
                }
            }
            
            // Extract entity type
            Map<String, Object> entityType = (Map<String, Object>) rawResult.get('entity_type');
            if (entityType != null) {
                formatted.put('entityType', entityType.get('entity_description'));
            }
            
            // Extract entity name (from other_trading_name or construct from available data)
            Map<String, Object> tradingName = (Map<String, Object>) rawResult.get('other_trading_name');
            if (tradingName != null) {
                formatted.put('entityName', tradingName.get('organisation_name'));
            }
            
            // Extract GST information
            Map<String, Object> gstData = (Map<String, Object>) rawResult.get('goods_and_services_tax');
            if (gstData != null) {
                String gstFrom = (String) gstData.get('effective_from');
                if (String.isNotBlank(gstFrom)) {
                    formatted.put('gstStatus', 'Registered from ' + formatDate(gstFrom));
                }
            }
            
            // Extract ASIC number for main business location
            String asicNumber = (String) rawResult.get('asic_number');
            if (String.isNotBlank(asicNumber)) {
                formatted.put('mainBusinessLocation', 'VIC ' + asicNumber);
            }
            
            // Set default values if not found
            if (!formatted.containsKey('abnNumber')) {
                formatted.put('abnNumber', 'N/A');
            }
            if (!formatted.containsKey('entityName')) {
                formatted.put('entityName', 'N/A');
            }
            if (!formatted.containsKey('abnStatus')) {
                formatted.put('abnStatus', 'N/A');
            }
            if (!formatted.containsKey('entityType')) {
                formatted.put('entityType', 'N/A');
            }
            
        } catch (Exception e) {
            System.debug('Error processing single result: ' + e.getMessage());
            return null;
        }
        
        return formatted;
    }
    
    private static String formatDate(String dateString) {
        if (String.isBlank(dateString) || dateString == '0001-01-01') {
            return '';
        }
        
        try {
            Date parsedDate = Date.valueOf(dateString);
            return parsedDate.format();
        } catch (Exception e) {
            return dateString;
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
