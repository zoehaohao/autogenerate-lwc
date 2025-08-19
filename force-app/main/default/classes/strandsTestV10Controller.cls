public with sharing class strandsTestV10Controller {
    @AuraEnabled
    public static List<ABNResult> searchABN(String searchTerm) {
        try {
            // In a real implementation, this would call the ABN Lookup API
            // For demo purposes, returning mock data
            List<ABNResult> results = new List<ABNResult>();
            
            // Mock data based on the example
            results.add(new ABNResult(
                '45 004 189 708',
                'COLES SUPERMARKETS AUSTRALIA PTY LTD',
                'Active from 14 Feb 2000',
                'Australian Private Company',
                'Registered from 01 Jul 2000',
                'VIC 3123'
            ));
            
            return results;
        } catch (Exception e) {
            throw new AuraHandledException('Error searching ABN: ' + e.getMessage());
        }
    }
    
    // Wrapper class for ABN results
    public class ABNResult {
        @AuraEnabled public String abn;
        @AuraEnabled public String entityName;
        @AuraEnabled public String abnStatus;
        @AuraEnabled public String entityType;
        @AuraEnabled public String gst;
        @AuraEnabled public String location;
        
        public ABNResult(String abn, String entityName, String abnStatus, 
                        String entityType, String gst, String location) {
            this.abn = abn;
            this.entityName = entityName;
            this.abnStatus = abnStatus;
            this.entityType = entityType;
            this.gst = gst;
            this.location = location;
        }
    }
}