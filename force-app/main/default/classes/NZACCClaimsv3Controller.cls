public with sharing class NZACCClaimsv3Controller {
    @AuraEnabled(cacheable=true)
    public static List<ClaimWrapper> getAllClaims() {
        // In a real implementation, this would query the database
        // This is a mock implementation for demonstration
        return generateMockClaims();
    }
    
    @AuraEnabled(cacheable=true)
    public static List<ClaimWrapper> searchClaims(String searchTerm, String status) {
        // In a real implementation, this would query the database with filters
        // This is a mock implementation for demonstration
        List<ClaimWrapper> allClaims = generateMockClaims();
        List<ClaimWrapper> filteredClaims = new List<ClaimWrapper>();
        
        for(ClaimWrapper claim : allClaims) {
            Boolean matchesSearch = String.isBlank(searchTerm) || 
                claim.claimNumber.containsIgnoreCase(searchTerm) ||
                claim.claimantName.containsIgnoreCase(searchTerm);
                
            Boolean matchesStatus = String.isBlank(status) || 
                claim.status == status;
                
            if(matchesSearch && matchesStatus) {
                filteredClaims.add(claim);
            }
        }
        
        return filteredClaims;
    }
    
    private static List<ClaimWrapper> generateMockClaims() {
        List<ClaimWrapper> claims = new List<ClaimWrapper>();
        
        claims.add(new ClaimWrapper(
            'CLM-001', 'New', Date.today(), 'John Doe',
            'Back Injury', 5000.00
        ));
        
        claims.add(new ClaimWrapper(
            'CLM-002', 'In Progress', Date.today().addDays(-5), 'Jane Smith',
            'Wrist Sprain', 3500.00
        ));
        
        return claims;
    }
    
    public class ClaimWrapper {
        @AuraEnabled public String claimNumber;
        @AuraEnabled public String status;
        @AuraEnabled public Date dateFiled;
        @AuraEnabled public String claimantName;
        @AuraEnabled public String injuryType;
        @AuraEnabled public Decimal amount;
        
        public ClaimWrapper(String claimNumber, String status, Date dateFiled,
                          String claimantName, String injuryType, Decimal amount) {
            this.claimNumber = claimNumber;
            this.status = status;
            this.dateFiled = dateFiled;
            this.claimantName = claimantName;
            this.injuryType = injuryType;
            this.amount = amount;
        }
    }
}