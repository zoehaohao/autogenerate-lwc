public with sharing class abnLookupController {
    @AuraEnabled(cacheable=false)
    public static List<ABNResult> searchABN(String searchTerm) {
        try {
            // Input validation
            if (String.isBlank(searchTerm) || searchTerm.length() < 3) {
                throw new AuraHandledException('Search term must be at least 3 characters long');
            }

            // Call external ABN Lookup API
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('callout:ABN_Lookup_API/v1/search?term=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            request.setMethod('GET');
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('Accept', 'application/json');
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return parseABNResponse(response.getBody());
            } else {
                throw new AuraHandledException('Error from ABN Lookup API: ' + response.getStatus());
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    private static List<ABNResult> parseABNResponse(String responseBody) {
        List<ABNResult> results = new List<ABNResult>();
        
        try {
            Map<String, Object> responseMap = (Map<String, Object>)JSON.deserializeUntyped(responseBody);
            List<Object> entries = (List<Object>)responseMap.get('results');
            
            for (Object entry : entries) {
                Map<String, Object> abnEntry = (Map<String, Object>)entry;
                ABNResult result = new ABNResult();
                result.abn = (String)abnEntry.get('abn');
                result.businessName = (String)abnEntry.get('businessName');
                result.status = (String)abnEntry.get('status');
                results.add(result);
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error parsing API response: ' + e.getMessage());
        }
        
        return results;
    }
    
    public class ABNResult {
        @AuraEnabled public String abn;
        @AuraEnabled public String businessName;
        @AuraEnabled public String status;
    }
}
