public with sharing class newabnLookupTestController {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            if (String.isBlank(searchParams)) {
                return new ResponseWrapper(false, 'Search parameters are required', null);
            }
            
            // Parse search parameters
            Object tempParams = JSON.deserializeUntyped(searchParams);
            Map<String, Object> params = (Map<String, Object>) tempParams;
            
            String searchValue = (String) params.get('searchValue');
            String searchType = (String) params.get('searchType');
            
            if (String.isBlank(searchValue)) {
                return new ResponseWrapper(false, 'Search value is required', null);
            }
            
            // Validate input based on search type
            if (!validateSearchInput(searchValue, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Make API call
            List<Map<String, Object>> results = performAPICall(searchValue, searchType);
            
            if (results == null || results.isEmpty()) {
                return new ResponseWrapper(true, 'No results found', new List<Object>());
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', results);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An error occurred while searching: ' + e.getMessage(), null);
        }
    }
    
    private static Boolean validateSearchInput(String searchValue, String searchType) {
        if (String.isBlank(searchValue)) {
            return false;
        }
        
        String cleanValue = searchValue.replaceAll('\\s', '');
        
        switch on searchType {
            when 'abn' {
                return Pattern.matches('^\\d{11}$', cleanValue);
            }
            when 'acn' {
                return Pattern.matches('^\\d{9}$', cleanValue);
            }
            when 'name' {
                return searchValue.trim().length() >= 2;
            }
            when else {
                return searchValue.trim().length() >= 2;
            }
        }
    }
    
    private static List<Map<String, Object>> performAPICall(String searchValue, String searchType) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint with query parameters
            String endpoint = buildEndpoint(searchValue, searchType);
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(TIMEOUT_SECONDS * 1000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return parseAPIResponse(response.getBody());
            } else if (response.getStatusCode() == 404) {
                // No results found - return empty list
                return new List<Map<String, Object>>();
            } else {
                throw new CalloutException('API call failed with status: ' + response.getStatusCode() + ' - ' + response.getBody());
            }
            
        } catch (CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            throw new AuraHandledException('Unable to connect to ABN lookup service. Please try again later.');
        } catch (Exception e) {
            System.debug('API call error: ' + e.getMessage());
            throw new AuraHandledException('An error occurred while searching. Please try again.');
        }
    }
    
    private static String buildEndpoint(String searchValue, String searchType) {
        String endpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
        switch on searchType {
            when 'abn' {
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchValue.replaceAll('\\s', ''), 'UTF-8');
            }
            when 'acn' {
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchValue.replaceAll('\\s', ''), 'UTF-8');
            }
            when 'name' {
                endpoint += '?name=' + EncodingUtil.urlEncode(searchValue.trim(), 'UTF-8');
            }
            when else {
                endpoint += '?q=' + EncodingUtil.urlEncode(searchValue.trim(), 'UTF-8');
            }
        }
        
        return endpoint;
    }
    
    private static List<Map<String, Object>> parseAPIResponse(String responseBody) {
        try {
            if (String.isBlank(responseBody)) {
                return new List<Map<String, Object>>();
            }
            
            Object tempResponse = JSON.deserializeUntyped(responseBody);
            
            // Handle single result response
            if (tempResponse instanceof Map<String, Object>) {
                Map<String, Object> singleResult = (Map<String, Object>) tempResponse;
                Map<String, Object> processedResult = processResultData(singleResult);
                return new List<Map<String, Object>>{ processedResult };
            }
            
            // Handle multiple results response
            if (tempResponse instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResponse;
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> resultItem = (Map<String, Object>) item;
                        results.add(processResultData(resultItem));
                    }
                }
                
                return results;
            }
            
            return new List<Map<String, Object>>();
            
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format from ABN lookup service');
        }
    }
    
    private static Map<String, Object> processResultData(Map<String, Object> rawData) {
        Map<String, Object> processedResult = new Map<String, Object>();
        
        try {
            // Extract ABN information
            Map<String, Object> abnData = (Map<String, Object>) rawData.get('abn');
            String abnNumber = abnData != null ? (String) abnData.get('identifier_value') : 'N/A';
            
            // Extract entity status
            Map<String, Object> entityStatus = (Map<String, Object>) rawData.get('entity_status');
            String statusCode = entityStatus != null ? (String) entityStatus.get('entity_status_code') : 'N/A';
            String effectiveFrom = entityStatus != null ? (String) entityStatus.get('effective_from') : 'N/A';
            
            // Extract entity type
            Map<String, Object> entityType = (Map<String, Object>) rawData.get('entity_type');
            String entityDescription = entityType != null ? (String) entityType.get('entity_description') : 'N/A';
            
            // Extract trading name
            Map<String, Object> tradingName = (Map<String, Object>) rawData.get('other_trading_name');
            String organisationName = tradingName != null ? (String) tradingName.get('organisation_name') : 'N/A';
            
            // Extract GST information
            Map<String, Object> gstData = (Map<String, Object>) rawData.get('goods_and_services_tax');
            String gstFrom = gstData != null ? (String) gstData.get('effective_from') : null;
            String gstStatus = String.isNotBlank(gstFrom) ? 'Registered from ' + formatDate(gstFrom) : 'Not registered';
            
            // Extract ASIC number for business location
            String asicNumber = (String) rawData.get('asic_number');
            String businessLocation = String.isNotBlank(asicNumber) ? 'VIC ' + asicNumber : 'N/A';
            
            // Build processed result
            processedResult.put('abnNumber', formatABN(abnNumber));
            processedResult.put('entityName', organisationName);
            processedResult.put('abnStatus', formatStatus(statusCode, effectiveFrom));
            processedResult.put('entityType', entityDescription);
            processedResult.put('gstStatus', gstStatus);
            processedResult.put('businessLocation', businessLocation);
            processedResult.put('rawData', rawData);
            
        } catch (Exception e) {
            System.debug('Error processing result data: ' + e.getMessage());
            // Return basic structure with N/A values if processing fails
            processedResult.put('abnNumber', 'N/A');
            processedResult.put('entityName', 'N/A');
            processedResult.put('abnStatus', 'N/A');
            processedResult.put('entityType', 'N/A');
            processedResult.put('gstStatus', 'N/A');
            processedResult.put('businessLocation', 'N/A');
            processedResult.put('rawData', rawData);
        }
        
        return processedResult;
    }
    
    private static String formatABN(String abnNumber) {
        if (String.isBlank(abnNumber) || abnNumber.length() != 11) {
            return abnNumber;
        }
        
        // Format as XX XXX XXX XXX
        return abnNumber.substring(0, 2) + ' ' + 
               abnNumber.substring(2, 5) + ' ' + 
               abnNumber.substring(5, 8) + ' ' + 
               abnNumber.substring(8, 11);
    }
    
    private static String formatStatus(String statusCode, String effectiveFrom) {
        if (String.isBlank(statusCode)) {
            return 'N/A';
        }
        
        String formattedDate = formatDate(effectiveFrom);
        if (String.isNotBlank(formattedDate)) {
            return statusCode + ' from ' + formattedDate;
        }
        
        return statusCode;
    }
    
    private static String formatDate(String dateString) {
        if (String.isBlank(dateString) || dateString == '0001-01-01') {
            return null;
        }
        
        try {
            Date parsedDate = Date.valueOf(dateString);
            return parsedDate.format();
        } catch (Exception e) {
            return dateString;
        }
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
}
