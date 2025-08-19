public with sharing class strandsTestV10Controller {
    @AuraEnabled
    public static SearchResult searchABN(String searchTerm, Integer pageNumber, Integer pageSize) {
        try {
            // Mock data for demonstration - in real implementation, this would call the ABN Lookup API
            List<ABNRecord> records = new List<ABNRecord>();
            
            // Sample data based on the screenshot
            records.add(new ABNRecord(
                '45 004 189 708',
                'COLES SUPERMARKETS AUSTRALIA PTY LTD',
                'Active from 14 Feb 2000',
                'Australian Private Company',
                'Registered from 01 Jul 2000',
                'VIC 3123'
            ));
            
            // Calculate pagination
            Integer startIndex = (pageNumber - 1) * pageSize;
            Integer endIndex = Math.min(startIndex + pageSize, records.size());
            
            return new SearchResult(
                records.subList(startIndex, endIndex),
                records.size()
            );
        } catch (Exception e) {
            throw new AuraHandledException('Error searching ABN: ' + e.getMessage());
        }
    }
    
    public class SearchResult {
        @AuraEnabled public List<ABNRecord> records;
        @AuraEnabled public Integer totalRecords;
        
        public SearchResult(List<ABNRecord> records, Integer totalRecords) {
            this.records = records;
            this.totalRecords = totalRecords;
        }
    }
    
    public class ABNRecord {
        @AuraEnabled public String abn;
        @AuraEnabled public String entityName;
        @AuraEnabled public String abnStatus;
        @AuraEnabled public String entityType;
        @AuraEnabled public String gst;
        @AuraEnabled public String location;
        
        public ABNRecord(String abn, String entityName, String abnStatus, 
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