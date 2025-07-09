public with sharing class abnSearchTestController {
    private static final String API_ENDPOINT = 'https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn';
    private static final Integer TIMEOUT = 30000; // 30 seconds

    @AuraEnabled
    public static List<Map<String, Object>> searchABN(String searchTerm) {
        try {
            // Validate input
            if (String.isBlank(searchTerm)) {
                throw new AbnLookupException('Search term cannot be empty');
            }

            // Prepare HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT + '?search=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            request.setMethod('GET');
            request.setTimeout(TIMEOUT);

            // Send request
            HttpResponse response = http.send(request);

            // Handle response
            if (response.getStatusCode() == 200) {
                return parseResponse(response.getBody());
            } else {
                throw new AbnLookupException('API request failed with status code: ' + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static List<Map<String, Object>> parseResponse(String responseBody) {
        try {
            Object parsed = JSON.deserializeUntyped(responseBody);
            if (!(parsed instanceof List<Object>)) {
                throw new AbnLookupException('Invalid response format');
            }

            List<Object> resultList = (List<Object>) parsed;
            List<Map<String, Object>> results = new List<Map<String, Object>>();

            for (Object item : resultList) {
                if (item instanceof Map<String, Object>) {
                    results.add((Map<String, Object>) item);
                }
            }

            return results;
        } catch (Exception e) {
            throw new AbnLookupException('Error parsing API response: ' + e.getMessage());
        }
    }

    public class AbnLookupException extends Exception {}
}
