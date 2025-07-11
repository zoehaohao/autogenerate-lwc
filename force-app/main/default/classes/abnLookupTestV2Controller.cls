public with sharing class abnLookupTestV2Controller {
    @AuraEnabled
    public static List<ABNResult> searchABN(String searchTerm) {
        try {
            // Validate input
            if (String.isBlank(searchTerm)) {
                throw new AuraHandledException('Search term cannot be empty');
            }

            // Prepare HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn?search=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout

            // Send request
            HttpResponse response = http.send(request);

            // Process response
            if (response.getStatusCode() == 200) {
                return parseResponse(response.getBody());
            } else {
                throw new AuraHandledException('API request failed with status code: ' + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static List<ABNResult> parseResponse(String responseBody) {
        List<ABNResult> results = new List<ABNResult>();
        
        try {
            List<Object> parsedResponse = (List<Object>)JSON.deserializeUntyped(responseBody);
            
            for (Object obj : parsedResponse) {
                Map<String, Object> resultMap = (Map<String, Object>)obj;
                ABNResult result = new ABNResult();
                result.id = String.valueOf(resultMap.get('id'));
                result.ABN = String.valueOf(resultMap.get('ABN'));
                result.EntityName = String.valueOf(resultMap.get('EntityName'));
                result.ABNStatus = String.valueOf(resultMap.get('ABNStatus'));
                result.EntityType = String.valueOf(resultMap.get('EntityType'));
                result.GoodsServicesGST = String.valueOf(resultMap.get('GoodsServicesGST'));
                result.MainBusinessLocation = String.valueOf(resultMap.get('MainBusinessLocation'));
                results.add(result);
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error parsing API response: ' + e.getMessage());
        }
        
        return results;
    }

    public class ABNResult {
        @AuraEnabled public String id;
        @AuraEnabled public String ABN;
        @AuraEnabled public String EntityName;
        @AuraEnabled public String ABNStatus;
        @AuraEnabled public String EntityType;
        @AuraEnabled public String GoodsServicesGST;
        @AuraEnabled public String MainBusinessLocation;
    }
}
