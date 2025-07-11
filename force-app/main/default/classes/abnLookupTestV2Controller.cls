public with sharing class abnLookupTestV2Controller {
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
            request.setEndpoint('https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn?search=' + 
                              EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout

            // Make the callout
            HttpResponse response = http.send(request);

            // Process response
            if (response.getStatusCode() == 200) {
                Object parsedResponse = JSON.deserializeUntyped(response.getBody());
                if (parsedResponse instanceof List<Object>) {
                    List<Object> resultsList = (List<Object>)parsedResponse;
                    List<Map<String, Object>> formattedResults = new List<Map<String, Object>>();
                    
                    for (Object obj : resultsList) {
                        if (obj instanceof Map<String, Object>) {
                            formattedResults.add((Map<String, Object>)obj);
                        }
                    }
                    
                    return formattedResults;
                }
                throw new AuraHandledException('Invalid response format');
            } else {
                throw new AuraHandledException('Error: HTTP ' + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
