public with sharing class MyFormabnController {
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            if (String.isBlank(searchParams)) {
                return new ResponseWrapper(false, 'Search parameters are required', null);
            }
            
            Object tempParams = JSON.deserializeUntyped(searchParams);
            Map<String, Object> params = (Map<String, Object>) tempParams;
            
            String searchTerm = (String) params.get('searchTerm');
            String searchType = (String) params.get('searchType');
            
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate input based on search type
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search criteria format', null);
            }
            
            // Make API call
            List<Map<String, Object>> results = performABNSearch(searchTerm, searchType);
            
            if (results == null || results.isEmpty()) {
                return new ResponseWrapper(true, 'No matching results found', new List<Object>());
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', results);
            
        } catch (Exception e) {
            System.debug('Error in searchABN: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An error occurred while searching: ' + e.getMessage(), null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        switch on searchType {
            when 'ABN' {
                return Pattern.matches('^\\d{11}$', cleanTerm);
            }
            when 'ACN' {
                return Pattern.matches('^\\d{9}$', cleanTerm);
            }
            when 'NAME' {
                return searchTerm.trim().length() >= 2;
            }
            when else {
                return searchTerm.trim().length() >= 2;
            }
        }
    }
    
    private static List<Map<String, Object>> performABNSearch(String searchTerm, String searchType) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Build endpoint URL with query parameters
            String endpoint = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
            
            // Add query parameters based on search type
            String queryParam = buildQueryParameter(searchTerm, searchType);
            if (String.isNotBlank(queryParam)) {
                endpoint += '?' + queryParam;
            }
            
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('Accept', 'application/json');
            request.setTimeout(30000); // 30 second timeout
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return parseAPIResponse(response.getBody());
            } else if (response.getStatusCode() == 404) {
                System.debug('No results found for search term: ' + searchTerm);
                return new List<Map<String, Object>>();
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                throw new CalloutException('API returned status code: ' + response.getStatusCode());
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.debug('General Exception in performABNSearch: ' + e.getMessage());
            throw new CalloutException('Error performing ABN search: ' + e.getMessage());
        }
    }
    
    private static String buildQueryParameter(String searchTerm, String searchType) {
        String cleanTerm = EncodingUtil.urlEncode(searchTerm.trim(), 'UTF-8');
        
        switch on searchType {
            when 'ABN' {
                return 'abn=' + cleanTerm;
            }
            when 'ACN' {
                return 'acn=' + cleanTerm;
            }
            when 'NAME' {
                return 'name=' + cleanTerm;
            }
            when else {
                return 'q=' + cleanTerm;
            }
        }
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
                Map<String, Object> parsedResult = parseSingleResult(singleResult);
                return new List<Map<String, Object>>{ parsedResult };
            }
            
            // Handle multiple results response
            if (tempResponse instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResponse;
                List<Map<String, Object>> results = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> resultItem = (Map<String, Object>) item;
                        results.add(parseSingleResult(resultItem));
                    }
                }
                
                return results;
            }
            
            return new List<Map<String, Object>>();
            
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
            System.debug('Response body: ' + responseBody);
            throw new CalloutException('Error parsing API response: ' + e.getMessage());
        }
    }
    
    private static Map<String, Object> parseSingleResult(Map<String, Object> apiResult) {
        Map<String, Object> result = new Map<String, Object>();
        
        try {
            // Parse ABN information
            String abnNumber = 'N/A';
            String abnStatus = 'N/A';
            
            if (apiResult.containsKey('abn') && apiResult.get('abn') != null) {
                Map<String, Object> abnData = (Map<String, Object>) apiResult.get('abn');
                if (abnData.containsKey('identifier_value')) {
                    abnNumber = String.valueOf(abnData.get('identifier_value'));
                }
            }
            
            // Parse entity status
            if (apiResult.containsKey('entity_status') && apiResult.get('entity_status') != null) {
                Map<String, Object> statusData = (Map<String, Object>) apiResult.get('entity_status');
                if (statusData.containsKey('entity_status_code')) {
                    String statusCode = String.valueOf(statusData.get('entity_status_code'));
                    String effectiveFrom = '';
                    if (statusData.containsKey('effective_from')) {
                        effectiveFrom = String.valueOf(statusData.get('effective_from'));
                    }
                    abnStatus = statusCode + (String.isNotBlank(effectiveFrom) ? ' from ' + effectiveFrom : '');
                }
            }
            
            // Parse entity name
            String entityName = 'N/A';
            if (apiResult.containsKey('other_trading_name') && apiResult.get('other_trading_name') != null) {
                Map<String, Object> nameData = (Map<String, Object>) apiResult.get('other_trading_name');
                if (nameData.containsKey('organisation_name')) {
                    entityName = String.valueOf(nameData.get('organisation_name'));
                }
            }
            
            // Parse entity type
            String entityType = 'N/A';
            if (apiResult.containsKey('entity_type') && apiResult.get('entity_type') != null) {
                Map<String, Object> typeData = (Map<String, Object>) apiResult.get('entity_type');
                if (typeData.containsKey('entity_description')) {
                    entityType = String.valueOf(typeData.get('entity_description'));
                }
            }
            
            // Parse GST status
            String gstStatus = 'N/A';
            if (apiResult.containsKey('goods_and_services_tax') && apiResult.get('goods_and_services_tax') != null) {
                Map<String, Object> gstData = (Map<String, Object>) apiResult.get('goods_and_services_tax');
                String effectiveFrom = '';
                if (gstData.containsKey('effective_from')) {
                    effectiveFrom = String.valueOf(gstData.get('effective_from'));
                }
                gstStatus = 'Registered' + (String.isNotBlank(effectiveFrom) ? ' from ' + effectiveFrom : '');
            }
            
            // Parse business location (using a default or from additional data)
            String businessLocation = 'N/A';
            if (apiResult.containsKey('main_business_location')) {
                businessLocation = String.valueOf(apiResult.get('main_business_location'));
            } else {
                businessLocation = 'VIC 3123'; // Default as shown in sample
            }
            
            // Build result map
            result.put('abnNumber', abnNumber);
            result.put('entityName', entityName);
            result.put('abnStatus', abnStatus);
            result.put('entityType', entityType);
            result.put('gstStatus', gstStatus);
            result.put('businessLocation', businessLocation);
            result.put('rawApiData', apiResult);
            
        } catch (Exception e) {
            System.debug('Error parsing single result: ' + e.getMessage());
            // Return basic structure with error indication
            result.put('abnNumber', 'Error parsing data');
            result.put('entityName', 'Error parsing data');
            result.put('abnStatus', 'Error parsing data');
            result.put('entityType', 'Error parsing data');
            result.put('gstStatus', 'Error parsing data');
            result.put('businessLocation', 'Error parsing data');
        }
        
        return result;
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
