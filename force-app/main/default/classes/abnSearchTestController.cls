public with sharing class abnSearchTestController {
    @AuraEnabled
    public static List<Map<String, Object>> searchABN(String searchTerm) {
        try {
            // Validate input
            if (String.isBlank(searchTerm)) {
                throw new AuraHandledException('Search term cannot be empty');
            }

            // Prepare HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn');
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout

            // Send request
            HttpResponse response = http.send(request);

            // Process response
            if (response.getStatusCode() == 200) {
                return processResponse(response.getBody());
            } else {
                throw new AuraHandledException('API request failed with status code: ' + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static List<Map<String, Object>> processResponse(String responseBody) {
        try {
            // Safe JSON parsing
            Object parsedData = JSON.deserializeUntyped(responseBody);
            if (!(parsedData instanceof List<Object>)) {
                throw new AuraHandledException('Invalid response format');
            }

            List<Object> resultList = (List<Object>)parsedData;
            List<Map<String, Object>> processedResults = new List<Map<String, Object>>();

            for (Object item : resultList) {
                if (item instanceof Map<String, Object>) {
                    processedResults.add((Map<String, Object>)item);
                }
            }

            return processedResults;
        } catch (Exception e) {
            throw new AuraHandledException('Error processing response: ' + e.getMessage());
        }
    }
}
