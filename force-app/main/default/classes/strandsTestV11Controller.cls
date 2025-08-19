public with sharing class strandsTestV11Controller {
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT = 30000; // 30 seconds

    @AuraEnabled
    public static Object searchBusinessEntities(String searchTerm, String searchType) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                throw new AuraHandledException('Search term cannot be empty');
            }

            // Validate search term format based on type
            validateSearchTerm(searchTerm, searchType);

            // Make API call
            HttpResponse response = makeAPICall(searchTerm, searchType);

            // Process response
            return processResponse(response);
        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static void validateSearchTerm(String searchTerm, String searchType) {
        switch on searchType {
            when 'ABN' {
                if (!searchTerm.matches('^\\d{11}$')) {
                    throw new AuraHandledException('ABN must be 11 digits');
                }
            }
            when 'ACN' {
                if (!searchTerm.matches('^\\d{9}$')) {
                    throw new AuraHandledException('ACN must be 9 digits');
                }
            }
            when 'NAME' {
                if (searchTerm.length() < 2) {
                    throw new AuraHandledException('Company name must be at least 2 characters');
                }
            }
        }
    }

    private static HttpResponse makeAPICall(String searchTerm, String searchType) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Build endpoint URL with query parameter
        String endpoint = API_ENDPOINT + '?q=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setTimeout(TIMEOUT);
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() != 200) {
            throw new AuraHandledException('API call failed with status code: ' + response.getStatusCode());
        }
        
        return response;
    }

    private static Object processResponse(HttpResponse response) {
        try {
            // Parse JSON response
            Object parsedResponse = JSON.deserializeUntyped(response.getBody());
            
            // Basic validation of response structure
            if (parsedResponse == null) {
                throw new AuraHandledException('Invalid response from API');
            }
            
            return parsedResponse;
        } catch (JSONException e) {
            throw new AuraHandledException('Error parsing API response: ' + e.getMessage());
        }
    }
}