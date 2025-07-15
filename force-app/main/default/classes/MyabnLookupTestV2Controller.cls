public with sharing class MyabnLookupTestV2Controller {
    
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
                return new ResponseWrapper(false, 'Invalid search criteria', null);
            }
            
            // Perform API callout
            String apiResponse = performAPICallout(searchTerm, searchType);
            
            if (String.isBlank(apiResponse)) {
                return new ResponseWrapper(false, 'No response from API', null);
            }
            
            // Parse and process response
            Object processedData = processAPIResponse(apiResponse);
            
            return new ResponseWrapper(true, 'Search completed successfully', processedData);
            
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
            when 'ABN' {
                // Validate 11-digit ABN
                return Pattern.matches('^\\d{11}$', trimmedTerm);
            }
            when 'ACN' {
                // Validate 9-digit ACN
                return Pattern.matches('^\\d{9}$', trimmedTerm);
            }
            when 'NAME' {
                // Validate company name (minimum 2 characters, alphanumeric with common business characters)
                return trimmedTerm.length() >= 2 && Pattern.matches('^[a-zA-Z0-9\\s&.-]+$', trimmedTerm);
            }
            when else {
                return false;
            }
        }
    }
    
    private static String performAPICallout(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        
        switch on searchType {
            when 'ABN' {
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'ACN' {
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
            when 'NAME' {
                endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            throw new CalloutException('No matching results found');
        } else {
            throw new CalloutException('API returned status code: ' + response.getStatusCode());
        }
    }
    
    private static Object processAPIResponse(String apiResponse) {
        try {
            Object tempData = JSON.deserializeUntyped(apiResponse);
            
            if (tempData == null) {
                return null;
            }
            
            // Handle both single object and array responses
            if (tempData instanceof List<Object>) {
                List<Object> tempList = (List<Object>) tempData;
                List<Map<String, Object>> processedResults = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> processedItem = processBusinessEntity((Map<String, Object>) item);
                        if (processedItem != null) {
                            processedResults.add(processedItem);
                        }
                    }
                }
                
                return processedResults;
            } else if (tempData instanceof Map<String, Object>) {
                Map<String, Object> processedItem = processBusinessEntity((Map<String, Object>) tempData);
                return processedItem != null ? new List<Map<String, Object>>{ processedItem } : null;
            }
            
            return null;
            
        } catch (JSONException e) {
            System.debug('JSON parsing error: ' + e.getMessage());
            throw new CalloutException('Invalid response format from API');
        }
    }
    
    private static Map<String, Object> processBusinessEntity(Map<String, Object> entityData) {
        if (entityData == null) {
            return null;
        }
        
        Map<String, Object> processedEntity = new Map<String, Object>();
        
        try {
            // Process ABN information
            Map<String, Object> abnData = (Map<String, Object>) entityData.get('abn');
            if (abnData != null) {
                processedEntity.put('abn', abnData);
            }
            
            // Process entity status
            Map<String, Object> entityStatus = (Map<String, Object>) entityData.get('entity_status');
            if (entityStatus != null) {
                processedEntity.put('entity_status', entityStatus);
            }
            
            // Process trading name
            Map<String, Object> tradingName = (Map<String, Object>) entityData.get('other_trading_name');
            if (tradingName != null) {
                processedEntity.put('other_trading_name', tradingName);
            }
            
            // Process entity type
            Map<String, Object> entityType = (Map<String, Object>) entityData.get('entity_type');
            if (entityType != null) {
                processedEntity.put('entity_type', entityType);
            }
            
            // Process GST information
            Map<String, Object> gstInfo = (Map<String, Object>) entityData.get('goods_and_services_tax');
            if (gstInfo != null) {
                processedEntity.put('goods_and_services_tax', gstInfo);
            }
            
            // Process other fields
            if (entityData.containsKey('asic_number')) {
                processedEntity.put('asic_number', entityData.get('asic_number'));
            }
            
            if (entityData.containsKey('record_last_updated_date')) {
                processedEntity.put('record_last_updated_date', entityData.get('record_last_updated_date'));
            }
            
            if (entityData.containsKey('main_business_location')) {
                processedEntity.put('main_business_location', entityData.get('main_business_location'));
            }
            
            // Process DGR endorsement if present
            Map<String, Object> dgrEndorsement = (Map<String, Object>) entityData.get('dgr_endorsement');
            if (dgrEndorsement != null) {
                processedEntity.put('dgr_endorsement', dgrEndorsement);
            }
            
            return processedEntity;
            
        } catch (Exception e) {
            System.debug('Error processing entity data: ' + e.getMessage());
            return null;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static ResponseWrapper getSearchHistory(String userId) {
        try {
            // This method can be implemented to retrieve search history if needed
            // For now, returning empty success response
            return new ResponseWrapper(true, 'Search history retrieved', new List<Object>());
        } catch (Exception e) {
            System.debug('Error retrieving search history: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to retrieve search history', null);
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
            this.timestamp = DateTime.now().formatGMT('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        }
        
        public ResponseWrapper(Boolean success, String message, Object data, List<String> errors) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.errors = errors != null ? errors : new List<String>();
            this.timestamp = DateTime.now().formatGMT('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
        }
    }
}
