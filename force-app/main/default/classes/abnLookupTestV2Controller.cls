public with sharing class abnLookupTestV2Controller {
    @AuraEnabled
    public static List<Map<String, Object>> searchABN(String searchTerm) {
        try {
            // Initialize HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://api.mockfly.dev/mocks/d24e2248-c254-46be-8b45-0365cdca1a44/businessentities/abnid');
            request.setMethod('GET');
            request.setTimeout(30000); // 30 second timeout

            // Add search parameter
            request.setHeader('Content-Type', 'application/json');
            
            // Send request
            HttpResponse response = http.send(request);
            
            // Process response
            if (response.getStatusCode() == 200) {
                // Parse JSON response
                Object parsed = JSON.deserializeUntyped(response.getBody());
                if (parsed instanceof List<Object>) {
                    return (List<Map<String, Object>>) parsed;
                } else {
                    List<Map<String, Object>> results = new List<Map<String, Object>>();
                    results.add((Map<String, Object>) parsed);
                    return results;
                }
            } else {
                throw new AuraHandledException('Error calling ABN API: ' + response.getStatusCode() + ' ' + response.getStatus());
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error processing request: ' + e.getMessage());
        }
    }
}
