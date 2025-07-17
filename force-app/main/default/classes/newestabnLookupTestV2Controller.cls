public with sharing class newestabnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchABN(String searchParams) {
        try {
            // Parse search parameters
            Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(searchParams);
            String searchValue = (String) params.get('searchValue');
            String searchType = (String) params.get('searchType');
            
            // Validate input
            if (String.isBlank(searchValue)) {
                return new ResponseWrapper(false, 'Search value is required', null);
            }
            
            // Sanitize input
            searchValue = sanitizeInput(searchValue);
            
            // Validate search type specific requirements
            String validationError = validateSearchInput(searchValue, searchType);
            if (validationError != null) {
                return new ResponseWrapper(false, validationError, null);
            }
            
            // Make API call
            String apiResponse = makeAPICall(searchValue, searchType);
            
            // Parse and process response
            Object processedData = processAPIResponse(apiResponse);
            
            return new ResponseWrapper(true, 'Search completed successfully', processedData);
            
        } catch (CalloutException e) {
            System.debug('Callout error: ' + e.getMessage());
            return new ResponseWrapper(false, 'Unable to connect to ABN service. Please try again later.', null);
        } catch (Exception e) {
            System.debug('Search error: ' + e.getMessage());
            return new ResponseWrapper(false, 'An error occurred during search. Please try again.', null);
        }
    }
    
    private static String sanitizeInput(String input) {
        if (String.isBlank(input)) {
            return '';
        }
        
        // Remove potentially harmful characters and normalize
        return input.trim()
                   .replaceAll('[<>"\']', '')
                   .replaceAll('\\s+', ' ');
    }
    
    private static String validateSearchInput(String searchValue, String searchType) {
        if (String.isBlank(searchValue)) {
            return 'Search value cannot be empty';
        }
        
        switch (searchType) {
            case 'abn':
                String abnDigits = searchValue.replaceAll('\\D', '');
                if (abnDigits.length() != 11) {
                    return 'ABN must be exactly 11 digits';
                }
                break;
            case 'acn':
                String acnDigits = searchValue.replaceAll('\\D', '');
                if (acnDigits.length() != 9) {
                    return 'ACN must be exactly 9 digits';
                }
                break;
            case 'name':
                if (searchValue.length() < 2) {
                    return 'Company name must be at least 2 characters';
                }
                if (searchValue.length() > 200) {
                    return 'Company name cannot exceed 200 characters';
                }
                break;
            default:
                return 'Invalid search type';
        }
        
        return null;
    }
    
    private static String makeAPICall(String searchValue, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = buildEndpoint(searchValue, searchType);
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else if (response.getStatusCode() == 404) {
            throw new CalloutException('No results found for the provided search criteria');
        } else {
            throw new CalloutException('API returned status code: ' + response.getStatusCode());
        }
    }
    
    private static String buildEndpoint(String searchValue, String searchType) {
        String baseEndpoint = API_ENDPOINT;
        
        // Add query parameters based on search type
        switch (searchType) {
            case 'abn':
                return baseEndpoint + '?abn=' + EncodingUtil.urlEncode(searchValue.replaceAll('\\D', ''), 'UTF-8');
            case 'acn':
                return baseEndpoint + '?acn=' + EncodingUtil.urlEncode(searchValue.replaceAll('\\D', ''), 'UTF-8');
            case 'name':
                return baseEndpoint + '?name=' + EncodingUtil.urlEncode(searchValue, 'UTF-8');
            default:
                return baseEndpoint + '?q=' + EncodingUtil.urlEncode(searchValue, 'UTF-8');
        }
    }
    
    private static Object processAPIResponse(String responseBody) {
        if (String.isBlank(responseBody)) {
            return null;
        }
        
        try {
            // Parse JSON response safely
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            if (tempResult instanceof List<Object>) {
                // Handle array response
                List<Object> tempList = (List<Object>) tempResult;
                List<Map<String, Object>> processedResults = new List<Map<String, Object>>();
                
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> processedItem = processBusinessEntity((Map<String, Object>) item);
                        processedResults.add(processedItem);
                    }
                }
                
                return processedResults;
            } else if (tempResult instanceof Map<String, Object>) {
                // Handle single object response
                Map<String, Object> singleResult = (Map<String, Object>) tempResult;
                return processBusinessEntity(singleResult);
            }
            
            return tempResult;
            
        } catch (JSONException e) {
            System.debug('JSON parsing error: ' + e.getMessage());
            throw new CalloutException('Invalid response format from ABN service');
        }
    }
    
    private static Map<String, Object> processBusinessEntity(Map<String, Object> rawData) {
        Map<String, Object> processedEntity = new Map<String, Object>();
        
        // Copy all original data
        processedEntity.putAll(rawData);
        
        // Add computed fields for easier access
        processedEntity.put('computed_abn_number', extractABNNumber(rawData));
        processedEntity.put('computed_entity_name', extractEntityName(rawData));
        processedEntity.put('computed_status_display', extractStatusDisplay(rawData));
        processedEntity.put('computed_entity_type_display', extractEntityTypeDisplay(rawData));
        processedEntity.put('computed_gst_display', extractGSTDisplay(rawData));
        processedEntity.put('computed_location_display', extractLocationDisplay(rawData));
        
        return processedEntity;
    }
    
    // Helper methods for data extraction
    private static String extractABNNumber(Map<String, Object> data) {
        Map<String, Object> abnInfo = (Map<String, Object>) data.get('abn');
        return abnInfo != null ? (String) abnInfo.get('identifier_value') : null;
    }
    
    private static String extractEntityName(Map<String, Object> data) {
        Map<String, Object> tradingName = (Map<String, Object>) data.get('other_trading_name');
        if (tradingName != null) {
            return (String) tradingName.get('organisation_name');
        }
        return (String) data.get('entity_name');
    }
    
    private static String extractStatusDisplay(Map<String, Object> data) {
        Map<String, Object> entityStatus = (Map<String, Object>) data.get('entity_status');
        if (entityStatus != null) {
            String status = (String) entityStatus.get('entity_status_code');
            String effectiveFrom = (String) entityStatus.get('effective_from');
            
            if (String.isNotBlank(status) && String.isNotBlank(effectiveFrom) && !effectiveFrom.equals('0001-01-01')) {
                return status + ' from ' + formatDate(effectiveFrom);
            }
            return status;
        }
        return null;
    }
    
    private static String extractEntityTypeDisplay(Map<String, Object> data) {
        Map<String, Object> entityType = (Map<String, Object>) data.get('entity_type');
        return entityType != null ? (String) entityType.get('entity_description') : null;
    }
    
    private static String extractGSTDisplay(Map<String, Object> data) {
        Map<String, Object> gst = (Map<String, Object>) data.get('goods_and_services_tax');
        if (gst != null) {
            String effectiveFrom = (String) gst.get('effective_from');
            if (String.isNotBlank(effectiveFrom) && !effectiveFrom.equals('0001-01-01')) {
                return 'Registered from ' + formatDate(effectiveFrom);
            }
        }
        return 'Not registered';
    }
    
    private static String extractLocationDisplay(Map<String, Object> data) {
        String asicNumber = (String) data.get('asic_number');
        String mainLocation = (String) data.get('main_business_location');
        
        return String.isNotBlank(mainLocation) ? mainLocation : 
               String.isNotBlank(asicNumber) ? asicNumber : null;
    }
    
    private static String formatDate(String dateString) {
        if (String.isBlank(dateString) || dateString.equals('0001-01-01')) {
            return dateString;
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
    
    // Test method for API connectivity
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper testAPIConnection() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT + '?test=true');
            request.setMethod('GET');
            request.setTimeout(10000);
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return new ResponseWrapper(true, 'API connection successful', response.getBody());
            } else {
                return new ResponseWrapper(false, 'API connection failed with status: ' + response.getStatusCode(), null);
            }
        } catch (Exception e) {
            return new ResponseWrapper(false, 'API connection test failed: ' + e.getMessage(), null);
        }
    }
}
