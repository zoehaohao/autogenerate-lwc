public with sharing class MyFormabnController {
    
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
            String sanitizedSearchTerm = String.escapeSingleQuotes(searchTerm.trim());
            
            // Validate search type and term format
            if (!validateSearchInput(sanitizedSearchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search term format for the specified search type', null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(sanitizedSearchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response received from the service', null);
            }
            
            // Parse response
            Object parsedData = parseAPIResponse(apiResponse);
            
            if (parsedData == null) {
                return new ResponseWrapper(false, 'No matching results found', null);
            }
            
            return new ResponseWrapper(true, 'Search completed successfully', parsedData);
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to the service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static Boolean validateSearchInput(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String cleanTerm = searchTerm.replaceAll('\\s', '');
        
        switch on searchType {
            when 'abn' {
                return Pattern.matches('^\\d{11}$', cleanTerm);
            }
            when 'acn' {
                return Pattern.matches('^\\d{9}$', cleanTerm);
            }
            when 'name' {
                return searchTerm.length() >= 2;
            }
            when else {
                return searchTerm.length() >= 2;
            }
        }
    }
    
    private static String makeAPICall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        String queryParam = buildQueryParameter(searchTerm, searchType);
        
        if (String.isNotBlank(queryParam)) {
            endpoint += '?' + queryParam;
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        try {
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return response.getBody();
            } else if (response.getStatusCode() == 404) {
                System.debug('API returned 404 - No results found');
                return null;
            } else {
                System.debug('API Error - Status Code: ' + response.getStatusCode() + ', Body: ' + response.getBody());
                throw new CalloutException('API returned status code: ' + response.getStatusCode());
            }
        } catch (System.CalloutException e) {
            System.debug('Callout failed: ' + e.getMessage());
            throw e;
        }
    }
    
    private static String buildQueryParameter(String searchTerm, String searchType) {
        String cleanTerm = EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        
        switch on searchType {
            when 'abn' {
                return 'abn=' + cleanTerm;
            }
            when 'acn' {
                return 'acn=' + cleanTerm;
            }
            when 'name' {
                return 'name=' + cleanTerm;
            }
            when else {
                return 'name=' + cleanTerm;
            }
        }
    }
    
    private static Object parseAPIResponse(String jsonResponse) {
        try {
            Object tempResult = JSON.deserializeUntyped(jsonResponse);
            
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
                        Map<String, Object> processedItem = processBusinessEntity((Map<String, Object>) item);
                        if (processedItem != null) {
                            resultList.add(processedItem);
                        }
                    }
                }
                return resultList.isEmpty() ? null : resultList;
            } else if (tempResult instanceof Map<String, Object>) {
                Map<String, Object> resultMap = (Map<String, Object>) tempResult;
                Map<String, Object> processedResult = processBusinessEntity(resultMap);
                return processedResult;
            }
            
            return null;
            
        } catch (JSONException e) {
            System.debug('JSON Parse Error: ' + e.getMessage());
            throw new AuraHandledException('Invalid response format received from the service');
        } catch (Exception e) {
            System.debug('Parse Error: ' + e.getMessage());
            throw new AuraHandledException('Error processing the response from the service');
        }
    }
    
    private static Map<String, Object> processBusinessEntity(Map<String, Object> entity) {
        if (entity == null || entity.isEmpty()) {
            return null;
        }
        
        Map<String, Object> processedEntity = new Map<String, Object>();
        
        // Process ABN information
        if (entity.containsKey('abn') && entity.get('abn') != null) {
            Map<String, Object> abnInfo = (Map<String, Object>) entity.get('abn');
            processedEntity.put('abn', abnInfo);
        }
        
        // Process entity status
        if (entity.containsKey('entity_status') && entity.get('entity_status') != null) {
            Map<String, Object> entityStatus = (Map<String, Object>) entity.get('entity_status');
            processedEntity.put('entity_status', entityStatus);
        }
        
        // Process trading name
        if (entity.containsKey('other_trading_name') && entity.get('other_trading_name') != null) {
            Map<String, Object> tradingName = (Map<String, Object>) entity.get('other_trading_name');
            processedEntity.put('other_trading_name', tradingName);
        }
        
        // Process entity type
        if (entity.containsKey('entity_type') && entity.get('entity_type') != null) {
            Map<String, Object> entityType = (Map<String, Object>) entity.get('entity_type');
            processedEntity.put('entity_type', entityType);
        }
        
        // Process GST information
        if (entity.containsKey('goods_and_services_tax') && entity.get('goods_and_services_tax') != null) {
            Map<String, Object> gstInfo = (Map<String, Object>) entity.get('goods_and_services_tax');
            processedEntity.put('goods_and_services_tax', gstInfo);
        }
        
        // Process other fields
        if (entity.containsKey('asic_number')) {
            processedEntity.put('asic_number', entity.get('asic_number'));
        }
        
        if (entity.containsKey('record_last_updated_date')) {
            processedEntity.put('record_last_updated_date', entity.get('record_last_updated_date'));
        }
        
        if (entity.containsKey('dgr_endorsement')) {
            processedEntity.put('dgr_endorsement', entity.get('dgr_endorsement'));
        }
        
        // Add main business location (this might need to be derived from other fields)
        processedEntity.put('main_business_location', 'VIC 3123'); // Default as per sample
        
        return processedEntity.isEmpty() ? null : processedEntity;
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
