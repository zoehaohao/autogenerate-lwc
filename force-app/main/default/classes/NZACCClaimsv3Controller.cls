public with sharing class NZACCClaimsv3Controller {
    @AuraEnabled
    public static ResponseWrapper submitClaim(Map<String, Object> claimData) {
        try {
            // Validate input
            if (claimData == null) {
                throw new AuraHandledException('Claim data cannot be null');
            }

            // Process claim data here
            // Add your business logic for claim submission

            return new ResponseWrapper(true, 'Claim submitted successfully', null);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Object data;
        
        public ResponseWrapper(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
    }
}