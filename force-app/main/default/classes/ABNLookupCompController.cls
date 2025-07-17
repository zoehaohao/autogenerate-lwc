public with sharing class ABNLookupCompController {
    
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
            if (!validateSearchInput(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search input format', null);
            }
            
            // Perform API callout
            HttpResponse response = performAPICallout(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                List<ABNResult> results = parseAPIResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', results);
            } else if (response.getStatusCode() == 404) {
                return new ResponseWrapper(true, 'No results found', new List<ABNResult>());
            } else {
                return new ResponseWrapper(false, 'API request failed with status: ' + response.getStatusCode(), null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String trimmedTerm = searchTerm.trim();
        
        switch on searchType {
            when 'abn' {
                return Pattern.matches('^\\d{11}$', trimmedTerm);
            }
            when 'acn' {
                return Pattern.matches('^\\d{9}$', trimmedTerm);
            }
            when 'name' {
                return trimmedTerm.length() >= 2;
            }
            when else {
                return false;
            }
        }
    }
    
    private static HttpResponse performAPICallout(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        if (searchType == 'abn') {
            endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        } else if (searchType == 'acn') {
            endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        } else {
            endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        return http.send(request);
    }
    
    private static List<ABNResult> parseAPIResponse(String responseBody) {
        List<ABNResult> results = new List<ABNResult>();
        
        try {
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            // Handle single result
            if (tempResult instanceof Map<String, Object>) {
                Map<String, Object> singleResult = (Map<String, Object>) tempResult;
                ABNResult abnResult = parseABNRecord(singleResult);
                if (abnResult != null) {
                    results.add(abnResult);
                }
            }
            // Handle multiple results
            else if (tempResult instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempResult;
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        ABNResult abnResult = parseABNRecord((Map<String, Object>) item);
                        if (abnResult != null) {
                            results.add(abnResult);
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            System.debug('Error parsing API response: ' + e.getMessage());
        }
        
        return results;
    }
    
    private static ABNResult parseABNRecord(Map<String, Object> record) {
        try {
            ABNResult result = new ABNResult();
            
            // Parse ABN information
            if (record.containsKey('abn') && record.get('abn') != null) {
                Map<String, Object> abnInfo = (Map<String, Object>) record.get('abn');
                result.abnNumber = (String) abnInfo.get('identifier_value');
            }
            
            // Parse entity status
            if (record.containsKey('entity_status') && record.get('entity_status') != null) {
                Map<String, Object> entityStatus = (Map<String, Object>) record.get('entity_status');
                String statusCode = (String) entityStatus.get('entity_status_code');
                String effectiveFrom = (String) entityStatus.get('effective_from');
                result.abnStatus = statusCode + (String.isNotBlank(effectiveFrom) ? ' from ' + formatDate(effectiveFrom) : '');
            }
            
            // Parse entity name from other_trading_name
            if (record.containsKey('other_trading_name') && record.get('other_trading_name') != null) {
                Map<String, Object> tradingName = (Map<String, Object>) record.get('other_trading_name');
                result.entityName = (String) tradingName.get('organisation_name');
            }
            
            // Parse entity type
            if (record.containsKey('entity_type') && record.get('entity_type') != null) {
                Map<String, Object> entityType = (Map<String, Object>) record.get('entity_type');
                result.entityType = (String) entityType.get('entity_description');
            }
            
            // Parse GST information
            if (record.containsKey('goods_and_services_tax') && record.get('goods_and_services_tax') != null) {
                Map<String, Object> gstInfo = (Map<String, Object>) record.get('goods_and_services_tax');
                String effectiveFrom = (String) gstInfo.get('effective_from');
                result.gstStatus = String.isNotBlank(effectiveFrom) ? 'Registered from ' + formatDate(effectiveFrom) : 'Not registered';
            }
            
            // Parse ASIC number for business location
            if (record.containsKey('asic_number') && record.get('asic_number') != null) {
                result.businessLocation = 'VIC ' + (String) record.get('asic_number');
            }
            
            // Set default values if not found
            if (String.isBlank(result.abnNumber)) result.abnNumber = 'N/A';
            if (String.isBlank(result.entityName)) result.entityName = 'N/A';
            if (String.isBlank(result.abnStatus)) result.abnStatus = 'N/A';
            if (String.isBlank(result.entityType)) result.entityType = 'N/A';
            if (String.isBlank(result.gstStatus)) result.gstStatus = 'N/A';
            if (String.isBlank(result.businessLocation)) result.businessLocation = 'N/A';
            
            return result;
            
        } catch (Exception e) {
            System.debug('Error parsing ABN record: ' + e.getMessage());
            return null;
        }
    }
    
    private static String formatDate(String dateString) {
        try {
            if (String.isNotBlank(dateString) && dateString != '0001-01-01') {
                Date parsedDate = Date.valueOf(dateString);
                return parsedDate.format();
            }
        } catch (Exception e) {
            System.debug('Error formatting date: ' + e.getMessage());
        }
        return dateString;
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
    }
    
    // ABN Result class
    public class ABNResult {
        @AuraEnabled public String abnNumber;
        @AuraEnabled public String entityName;
        @AuraEnabled public String abnStatus;
        @AuraEnabled public String entityType;
        @AuraEnabled public String gstStatus;
        @AuraEnabled public String businessLocation;
        
        public ABNResult() {
            this.abnNumber = '';
            this.entityName = '';
            this.abnStatus = '';
            this.entityType = '';
            this.gstStatus = '';
            this.businessLocation = '';
        }
    }
}
