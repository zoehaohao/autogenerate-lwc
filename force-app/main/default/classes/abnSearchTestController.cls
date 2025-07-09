public with sharing class abnSearchTestController {
    @AuraEnabled
    public static List<BusinessResult> searchABN(String searchTerm) {
        try {
            // Validate input
            if (String.isBlank(searchTerm)) {
                throw new AbnLookupException('Search term cannot be empty');
            }

            // Prepare HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn?q=' + 
                              EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
            request.setMethod('GET');
            request.setTimeout(30000); // 30 seconds timeout

            // Make the callout
            HttpResponse response = http.send(request);

            // Process response
            if (response.getStatusCode() == 200) {
                return (List<BusinessResult>) JSON.deserialize(
                    response.getBody(), 
                    List<BusinessResult>.class
                );
            } else {
                throw new AbnLookupException('API Error: ' + response.getStatus());
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class BusinessResult {
        @AuraEnabled public String abn { get; set; }
        @AuraEnabled public String acn { get; set; }
        @AuraEnabled public String businessName { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public String type { get; set; }
        @AuraEnabled public String state { get; set; }
    }

    public class AbnLookupException extends Exception {}
}
