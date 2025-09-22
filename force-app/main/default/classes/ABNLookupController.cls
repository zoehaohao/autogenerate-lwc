public with sharing class ABNLookupController {
    @AuraEnabled
    public static ValidationResult validateABN(String abnNumber) {
        try {
            // Remove any spaces or special characters
            abnNumber = abnNumber.replaceAll('[^0-9]', '');
            
            // Validate ABN format
            if (abnNumber.length() != 11) {
                return new ValidationResult(false, 'ABN must be 11 digits');
            }
            
            // TODO: Implement actual ABN validation logic or API call here
            // For now, using basic validation
            Boolean isValid = true; // Replace with actual validation
            
            return new ValidationResult(isValid, isValid ? 'Valid ABN' : 'Invalid ABN');
        } catch (Exception e) {
            System.debug('Error validating ABN: ' + e.getMessage());
            throw new AuraHandledException('Error processing ABN validation: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void sendSMSNotification(String mobileNumber, String message) {
        try {
            // Validate mobile number format
            if (String.isBlank(mobileNumber)) {
                throw new AuraHandledException('Mobile number is required');
            }
            
            // Remove any spaces or special characters except + for international prefix
            mobileNumber = mobileNumber.replaceAll('[^0-9+]', '');
            
            // Call the SMS sending service
            Map<String, String> smsResponse = sendSMS(mobileNumber, message);
            
            if (smsResponse.get('statusCode') != '200') {
                throw new AuraHandledException('Failed to send SMS: ' + smsResponse.get('body'));
            }
        } catch (Exception e) {
            System.debug('Error sending SMS: ' + e.getMessage());
            throw new AuraHandledException('Error sending SMS notification: ' + e.getMessage());
        }
    }
    
    private static Map<String, String> sendSMS(String phoneNumber, String message) {
        // Call the external SMS service
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:SMS_Service');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        
        Map<String, String> requestBody = new Map<String, String>{
            'phone_number' => phoneNumber,
            'message' => message
        };
        
        request.setBody(JSON.serialize(requestBody));
        
        HttpResponse response = http.send(request);
        
        return new Map<String, String>{
            'statusCode' => String.valueOf(response.getStatusCode()),
            'body' => response.getBody()
        };
    }
    
    public class ValidationResult {
        @AuraEnabled public Boolean isValid { get; set; }
        @AuraEnabled public String message { get; set; }
        
        public ValidationResult(Boolean isValid, String message) {
            this.isValid = isValid;
            this.message = message;
        }
    }
}