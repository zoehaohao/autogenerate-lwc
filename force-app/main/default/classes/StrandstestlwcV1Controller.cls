public with sharing class StrandstestlwcV1Controller {
    @AuraEnabled
    public static String processDocuments(List<String> fileIds, String userInput) {
        try {
            // Input validation
            if (fileIds == null || fileIds.isEmpty()) {
                throw new AuraHandledException('No files provided for processing.');
            }

            // Process each file
            List<ContentVersion> documents = [
                SELECT Id, Title, VersionData, FileType
                FROM ContentVersion
                WHERE ContentDocumentId IN :fileIds
                AND IsLatest = true
            ];

            // Process documents based on user input
            String processedResult = processDocumentContent(documents, userInput);
            return processedResult;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static String processDocumentContent(List<ContentVersion> documents, String userInput) {
        try {
            // Initialize StringBuilder for building response
            StringBuilder result = new StringBuilder();
            result.append('Processed ' + documents.size() + ' document(s)\n\n');

            // Process each document
            for (ContentVersion doc : documents) {
                // Extract text content based on file type
                String content = extractTextContent(doc);
                
                // Apply user input based processing
                String processedContent = applyUserProcessing(content, userInput);
                
                // Add to results
                result.append('Document: ' + doc.Title + '\n');
                result.append('Results: ' + processedContent + '\n\n');
            }

            return result.toString();

        } catch (Exception e) {
            throw new AuraHandledException('Error processing documents: ' + e.getMessage());
        }
    }

    private static String extractTextContent(ContentVersion doc) {
        // Basic text extraction - in real implementation, would need proper file type handling
        if (doc.FileType.equalsIgnoreCase('PDF')) {
            // PDF processing logic would go here
            return 'PDF content extracted';
        } else if (doc.FileType.equalsIgnoreCase('WORD')) {
            // Word document processing logic would go here
            return 'Word document content extracted';
        } else {
            // Default to plain text
            return EncodingUtil.base64Decode(EncodingUtil.base64Encode(doc.VersionData)).toString();
        }
    }

    private static String applyUserProcessing(String content, String userInput) {
        // Apply processing based on user input
        // This is a placeholder - actual implementation would depend on requirements
        if (String.isNotBlank(userInput)) {
            return 'Processed content based on user input: ' + userInput;
        }
        return 'Processed content with default settings';
    }

    private class StringBuilder {
        private String[] parts = new String[]{};
        
        public void append(String part) {
            parts.add(part);
        }
        
        public override String toString() {
            return String.join(parts, '');
        }
    }
}