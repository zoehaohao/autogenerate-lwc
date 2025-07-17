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
            
            // Validate search term based on type
            if (!validateSearchTerm(searchTerm, searchType)) {
                return new ResponseWrapper(false, 'Invalid search term format', null);
            }
            
            // Perform API callout
            HttpResponse response = performAPICallout(searchTerm, searchType);
            
            if (response.getStatusCode() == 200) {
                Object responseData = JSON.deserializeUntyped(response.getBody());
                
                // Process the response data
                List<Object> processedResults = processAPIResponse(responseData, searchType);
                
                return new ResponseWrapper(true, 'Search completed successfully', processedResults);
            } else {
                String errorMessage = 'API Error: ' + response.getStatus() + ' (' + response.getStatusCode() + ')';
                System.debug('API Error: ' + errorMessage + ' - Response: ' + response.getBody());
                return new ResponseWrapper(false, errorMessage, null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static Boolean validateSearchTerm(String searchTerm, String searchType) {
        if (String.isBlank(searchTerm)) {
            return false;
        }
        
        String trimmedTerm = searchTerm.trim();
        
        switch (searchType) {
            case 'abn':
                // Validate 11-digit ABN
                return Pattern.matches('^\\d{11}$', trimmedTerm);
            case 'acn':
                // Validate 9-digit ACN
                return Pattern.matches('^\\d{9}$', trimmedTerm);
            case 'name':
                // Validate minimum 2 characters for company name
                return trimmedTerm.length() >= 2;
            default:
                return false;
        }
    }
    
    private static HttpResponse performAPICallout(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
        switch (searchType) {
            case 'abn':
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
            case 'acn':
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
            case 'name':
                endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
                break;
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        System.debug('API Request - Endpoint: ' + endpoint);
        System.debug('API Request - Method: GET');
        
        HttpResponse response = http.send(request);
        
        System.debug('API Response - Status Code: ' + response.getStatusCode());
        System.debug('API Response - Status: ' + response.getStatus());
        System.debug('API Response - Body: ' + response.getBody());
        
        return response;
    }
    
    private static List<Object> processAPIResponse(Object responseData, String searchType) {
        List<Object> results = new List<Object>();
        
        try {
            if (responseData != null) {
                // Handle both single object and array responses
                if (responseData instanceof List<Object>) {
                    List<Object> responseList = (List<Object>) responseData;
                    for (Object item : responseList) {
                        if (item instanceof Map<String, Object>) {
                            results.add(sanitizeResponseData((Map<String, Object>) item));
                        }
                    }
                } else if (responseData instanceof Map<String, Object>) {
                    results.add(sanitizeResponseData((Map<String, Object>) responseData));
                }
            }
            
            // For company name searches, simulate multiple results if only one is returned
            if (searchType == 'name' && results.size() == 1) {
                Map<String, Object> originalResult = (Map<String, Object>) results[0];
                
                // Create additional mock results for demonstration
                for (Integer i = 2; i <= 6; i++) {
                    Map<String, Object> mockResult = originalResult.deepClone();
                    
                    // Modify some fields to create variation
                    Map<String, Object> abnData = (Map<String, Object>) mockResult.get('abn');
                    if (abnData != null) {
                        String originalAbn = (String) abnData.get('identifier_value');
                        if (String.isNotBlank(originalAbn) && originalAbn.length() >= 3) {
                            // Modify last few digits to create unique ABN
                            String modifiedAbn = originalAbn.substring(0, originalAbn.length() - 2) + 
                                                String.valueOf(i).leftPad(2, '0');
                            abnData.put('identifier_value', modifiedAbn);
                        }
                    }
                    
                    results.add(mockResult);
                }
            }
            
        } catch (Exception e) {
            System.debug('Error processing API response: ' + e.getMessage());
            // Return empty list on processing error
        }
        
        return results;
    }
    
    private static Map<String, Object> sanitizeResponseData(Map<String, Object> data) {
        Map<String, Object> sanitizedData = new Map<String, Object>();
        
        try {
            // Safely extract and sanitize each field
            sanitizedData.put('record_last_updated_date', 
                             sanitizeString((String) data.get('record_last_updated_date')));
            
            // Process ABN data
            Object abnObj = data.get('abn');
            if (abnObj instanceof Map<String, Object>) {
                sanitizedData.put('abn', sanitizeABNData((Map<String, Object>) abnObj));
            }
            
            // Process entity status
            Object entityStatusObj = data.get('entity_status');
            if (entityStatusObj instanceof Map<String, Object>) {
                sanitizedData.put('entity_status', sanitizeEntityStatusData((Map<String, Object>) entityStatusObj));
            }
            
            // Process other trading name
            Object tradingNameObj = data.get('other_trading_name');
            if (tradingNameObj instanceof Map<String, Object>) {
                sanitizedData.put('other_trading_name', sanitizeTradingNameData((Map<String, Object>) tradingNameObj));
            }
            
            // Process entity type
            Object entityTypeObj = data.get('entity_type');
            if (entityTypeObj instanceof Map<String, Object>) {
                sanitizedData.put('entity_type', sanitizeEntityTypeData((Map<String, Object>) entityTypeObj));
            }
            
            // Process GST data
            Object gstObj = data.get('goods_and_services_tax');
            if (gstObj instanceof Map<String, Object>) {
                sanitizedData.put('goods_and_services_tax', sanitizeGSTData((Map<String, Object>) gstObj));
            }
            
            // Process DGR endorsement
            Object dgrObj = data.get('dgr_endorsement');
            if (dgrObj instanceof Map<String, Object>) {
                sanitizedData.put('dgr_endorsement', sanitizeDGRData((Map<String, Object>) dgrObj));
            }
            
            // Add ASIC number
            sanitizedData.put('asic_number', sanitizeString((String) data.get('asic_number')));
            
        } catch (Exception e) {
            System.debug('Error sanitizing response data: ' + e.getMessage());
        }
        
        return sanitizedData;
    }
    
    private static Map<String, Object> sanitizeABNData(Map<String, Object> abnData) {
        Map<String, Object> sanitized = new Map<String, Object>();
        sanitized.put('identifier_value', sanitizeString((String) abnData.get('identifier_value')));
        sanitized.put('is_current_indicator', sanitizeString((String) abnData.get('is_current_indicator')));
        sanitized.put('replaced_from', sanitizeString((String) abnData.get('replaced_from')));
        return sanitized;
    }
    
    private static Map<String, Object> sanitizeEntityStatusData(Map<String, Object> statusData) {
        Map<String, Object> sanitized = new Map<String, Object>();
        sanitized.put('entity_status_code', sanitizeString((String) statusData.get('entity_status_code')));
        sanitized.put('effective_from', sanitizeString((String) statusData.get('effective_from')));
        sanitized.put('effective_to', sanitizeString((String) statusData.get('effective_to')));
        return sanitized;
    }
    
    private static Map<String, Object> sanitizeTradingNameData(Map<String, Object> nameData) {
        Map<String, Object> sanitized = new Map<String, Object>();
        sanitized.put('organisation_name', sanitizeString((String) nameData.get('organisation_name')));
        sanitized.put('effective_from', sanitizeString((String) nameData.get('effective_from')));
        sanitized.put('effective_to', sanitizeString((String) nameData.get('effective_to')));
        return sanitized;
    }
    
    private static Map<String, Object> sanitizeEntityTypeData(Map<String, Object> typeData) {
        Map<String, Object> sanitized = new Map<String, Object>();
        sanitized.put('entity_type_code', sanitizeString((String) typeData.get('entity_type_code')));
        sanitized.put('entity_description', sanitizeString((String) typeData.get('entity_description')));
        return sanitized;
    }
    
    private static Map<String, Object> sanitizeGSTData(Map<String, Object> gstData) {
        Map<String, Object> sanitized = new Map<String, Object>();
        sanitized.put('effective_from', sanitizeString((String) gstData.get('effective_from')));
        sanitized.put('effective_to', sanitizeString((String) gstData.get('effective_to')));
        return sanitized;
    }
    
    private static Map<String, Object> sanitizeDGRData(Map<String, Object> dgrData) {
        Map<String, Object> sanitized = new Map<String, Object>();
        sanitized.put('endorsed_from', sanitizeString((String) dgrData.get('endorsed_from')));
        sanitized.put('endorsed_to', sanitizeString((String) dgrData.get('endorsed_to')));
        sanitized.put('entity_endorsement', sanitizeString((String) dgrData.get('entity_endorsement')));
        sanitized.put('item_number', sanitizeString((String) dgrData.get('item_number')));
        return sanitized;
    }
    
    private static String sanitizeString(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        // Remove potentially harmful characters and trim
        return input.trim()
                   .replaceAll('[<>"\']', '')
                   .replaceAll('\\s+', ' ');
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
