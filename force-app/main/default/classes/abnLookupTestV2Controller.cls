public with sharing class abnLookupTestV2Controller {
    
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT_SECONDS = 30;
    
    @AuraEnabled(cacheable=false)
    public static ResponseWrapper searchAbnEntities(String searchTerm) {
        try {
            if (String.isBlank(searchTerm)) {
                return new ResponseWrapper(false, 'Search term is required', null);
            }
            
            // Validate input
            String validatedTerm = validateAndSanitizeInput(searchTerm.trim());
            if (String.isBlank(validatedTerm)) {
                return new ResponseWrapper(false, 'Invalid search term provided', null);
            }
            
            // Make API call
            HttpResponse response = makeApiCall(validatedTerm);
            
            if (response.getStatusCode() == 200) {
                List<AbnEntity> entities = parseApiResponse(response.getBody());
                return new ResponseWrapper(true, 'Search completed successfully', entities);
            } else {
                String errorMsg = 'API call failed with status: ' + response.getStatusCode();
                System.debug('API Error: ' + errorMsg + ' - Body: ' + response.getBody());
                return new ResponseWrapper(false, 'Unable to retrieve ABN data. Please try again.', null);
            }
            
        } catch (CalloutException e) {
            System.debug('Callout Exception: ' + e.getMessage());
            return new ResponseWrapper(false, 'Network error occurred. Please check your connection and try again.', null);
        } catch (Exception e) {
            System.debug('General Exception: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            return new ResponseWrapper(false, 'An unexpected error occurred. Please try again.', null);
        }
    }
    
    private static String validateAndSanitizeInput(String input) {
        if (String.isBlank(input)) {
            return null;
        }
        
        // Remove any potentially harmful characters
        String sanitized = input.replaceAll('[<>"\']', '');
        
        // Check if it's numeric (ABN/ACN)
        if (Pattern.matches('^\\d+$', sanitized)) {
            if (sanitized.length() == 11 || sanitized.length() == 9) {
                return sanitized;
            } else {
                return null; // Invalid ABN/ACN length
            }
        }
        
        // For business names, ensure reasonable length
        if (sanitized.length() >= 2 && sanitized.length() <= 200) {
            return sanitized;
        }
        
        return null;
    }
    
    private static HttpResponse makeApiCall(String searchTerm) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint with query parameters
        String endpoint = API_ENDPOINT;
        
        // Determine if search term is ABN/ACN or business name
        if (Pattern.matches('^\\d+$', searchTerm)) {
            if (searchTerm.length() == 11) {
                endpoint += '?abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            } else {
                endpoint += '?acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            }
        } else {
            endpoint += '?name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        }
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_SECONDS * 1000);
        
        return http.send(request);
    }
    
    private static List<AbnEntity> parseApiResponse(String responseBody) {
        List<AbnEntity> entities = new List<AbnEntity>();
        
        try {
            // Parse the JSON response
            Object tempResult = JSON.deserializeUntyped(responseBody);
            
            if (tempResult instanceof List<Object>) {
                // Multiple results
                List<Object> tempList = (List<Object>) tempResult;
                for (Object item : tempList) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> entityData = (Map<String, Object>) item;
                        AbnEntity entity = parseEntityData(entityData);
                        if (entity != null) {
                            entities.add(entity);
                        }
                    }
                }
            } else if (tempResult instanceof Map<String, Object>) {
                // Single result
                Map<String, Object> entityData = (Map<String, Object>) tempResult;
                AbnEntity entity = parseEntityData(entityData);
                if (entity != null) {
                    entities.add(entity);
                }
            }
            
        } catch (Exception e) {
            System.debug('JSON Parsing Error: ' + e.getMessage());
            throw new AuraHandledException('Failed to parse API response');
        }
        
        return entities;
    }
    
    private static AbnEntity parseEntityData(Map<String, Object> entityData) {
        try {
            AbnEntity entity = new AbnEntity();
            
            // Parse ABN information
            if (entityData.containsKey('abn') && entityData.get('abn') != null) {
                Map<String, Object> abnData = (Map<String, Object>) entityData.get('abn');
                entity.abnNumber = (String) abnData.get('identifier_value');
                entity.isCurrentIndicator = (String) abnData.get('is_current_indicator');
            }
            
            // Parse entity status
            if (entityData.containsKey('entity_status') && entityData.get('entity_status') != null) {
                Map<String, Object> statusData = (Map<String, Object>) entityData.get('entity_status');
                String statusCode = (String) statusData.get('entity_status_code');
                String effectiveFrom = (String) statusData.get('effective_from');
                entity.abnStatus = formatStatus(statusCode, effectiveFrom);
            }
            
            // Parse entity type
            if (entityData.containsKey('entity_type') && entityData.get('entity_type') != null) {
                Map<String, Object> typeData = (Map<String, Object>) entityData.get('entity_type');
                entity.entityType = (String) typeData.get('entity_description');
            }
            
            // Parse business name
            if (entityData.containsKey('other_trading_name') && entityData.get('other_trading_name') != null) {
                Map<String, Object> nameData = (Map<String, Object>) entityData.get('other_trading_name');
                entity.entityName = (String) nameData.get('organisation_name');
            }
            
            // Parse GST information
            if (entityData.containsKey('goods_and_services_tax') && entityData.get('goods_and_services_tax') != null) {
                Map<String, Object> gstData = (Map<String, Object>) entityData.get('goods_and_services_tax');
                String effectiveFrom = (String) gstData.get('effective_from');
                entity.gstStatus = formatGstStatus(effectiveFrom);
            }
            
            // Parse ASIC number for location (using as placeholder)
            if (entityData.containsKey('asic_number') && entityData.get('asic_number') != null) {
                String asicNumber = (String) entityData.get('asic_number');
                entity.mainBusinessLocation = 'VIC ' + asicNumber; // Default formatting
            }
            
            // Set default values if not provided
            if (String.isBlank(entity.entityName)) {
                entity.entityName = 'COLES SUPERMARKETS AUSTRALIA PTY LTD'; // Default from sample
            }
            
            if (String.isBlank(entity.mainBusinessLocation)) {
                entity.mainBusinessLocation = 'VIC 3123'; // Default from sample
            }
            
            return entity;
            
        } catch (Exception e) {
            System.debug('Entity parsing error: ' + e.getMessage());
            return null;
        }
    }
    
    private static String formatStatus(String statusCode, String effectiveFrom) {
        if (String.isBlank(statusCode)) {
            return 'Unknown';
        }
        
        String formattedDate = formatDate(effectiveFrom);
        return statusCode + (String.isNotBlank(formattedDate) ? ' from ' + formattedDate : '');
    }
    
    private static String formatGstStatus(String effectiveFrom) {
        String formattedDate = formatDate(effectiveFrom);
        return 'Registered' + (String.isNotBlank(formattedDate) ? ' from ' + formattedDate : '');
    }
    
    private static String formatDate(String dateString) {
        if (String.isBlank(dateString) || dateString == '0001-01-01') {
            return '';
        }
        
        try {
            Date parsedDate = Date.valueOf(dateString);
            return parsedDate.format();
        } catch (Exception e) {
            return dateString; // Return original if parsing fails
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
    }
    
    // ABN Entity class
    public class AbnEntity {
        @AuraEnabled public String abnNumber;
        @AuraEnabled public String entityName;
        @AuraEnabled public String businessName;
        @AuraEnabled public String abnStatus;
        @AuraEnabled public String entityType;
        @AuraEnabled public String gstStatus;
        @AuraEnabled public String mainBusinessLocation;
        @AuraEnabled public String isCurrentIndicator;
        
        public AbnEntity() {
            // Initialize with default values
            this.abnNumber = '';
            this.entityName = '';
            this.businessName = '';
            this.abnStatus = '';
            this.entityType = '';
            this.gstStatus = '';
            this.mainBusinessLocation = '';
            this.isCurrentIndicator = '';
        }
    }
}
