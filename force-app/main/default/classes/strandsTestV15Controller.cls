public with sharing class strandsTestV15Controller {
    private static final String API_ENDPOINT = 'https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid';
    private static final Integer TIMEOUT = 30000; // 30 seconds

    @AuraEnabled
    public static Object searchBusinesses(String searchTerm) {
        try {
            // Input validation
            if (String.isBlank(searchTerm)) {
                throw new AuraHandledException('Search term cannot be empty');
            }

            // Determine search type and validate format
            String queryParam;
            if (searchTerm.length() == 11 && searchTerm.isNumeric()) {
                queryParam = 'abn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            } else if (searchTerm.length() == 9 && searchTerm.isNumeric()) {
                queryParam = 'acn=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            } else if (searchTerm.length() >= 2) {
                queryParam = 'name=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8');
            } else {
                throw new AuraHandledException('Invalid search term format');
            }

            // Prepare HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT + '?' + queryParam);
            request.setMethod('GET');
            request.setTimeout(TIMEOUT);

            // Make API call
            HttpResponse response = http.send(request);

            // Handle response
            if (response.getStatusCode() == 200) {
                return parseResponse(response.getBody());
            } else {
                throw new AuraHandledException('API Error: ' + response.getStatus());
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static Object parseResponse(String responseBody) {
        try {
            return JSON.deserializeUntyped(responseBody);
        } catch (Exception e) {
            throw new AuraHandledException('Error parsing API response: ' + e.getMessage());
        }
    }
}