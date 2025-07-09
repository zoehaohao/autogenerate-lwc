public with sharing class abnSearchTestController {
    private static final String API_ENDPOINT = 'https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn';
    private static final Integer TIMEOUT = 30000; // 30 seconds

    @AuraEnabled
    public static List<Map<String, Object>> searchABN(String searchTerm) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_ENDPOINT + '?search=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            request.setMethod('GET');
            request.setTimeout(TIMEOUT);

            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                return (List<Map<String, Object>>) JSON.deserializeUntyped(response.getBody());
            } else {
                throw new AuraHandledException('API Error: ' + response.getStatusCode() + ' ' + response.getStatus());
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error processing request: ' + e.getMessage());
        }
    }
}
