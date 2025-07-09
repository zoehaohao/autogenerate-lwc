public with sharing class AbnSearchTestController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> searchABN(String searchTerm) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn?search=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return new Map<String, Object>{
                    'success' => true,
                    'data' => response.getBody()
                };
            } else {
                return new Map<String, Object>{
                    'success' => false,
                    'error' => 'HTTP Error: ' + response.getStatusCode()
                };
            }
        } catch (Exception e) {
            return new Map<String, Object>{
                'success' => false,
                'error' => e.getMessage()
            };
        }
    }
}
