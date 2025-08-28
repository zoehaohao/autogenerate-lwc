import { LightningElement, api, track } from 'lwc';
import processDocuments from '@salesforce/apex/StrandstestlwcV1Controller.processDocuments';

export default class StrandstestlwcV1 extends LightningElement {
    @api recordId;
    @track userInput = '';
    @track processingResult;
    @track error;
    @track isProcessing = false;

    get acceptedFormats() {
        return ['.pdf', '.doc', '.docx', '.txt'];
    }

    uploadedFiles = [];

    handleUserInputChange(event) {
        this.userInput = event.target.value;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.uploadedFiles = [...this.uploadedFiles, ...uploadedFiles];
    }

    async handleProcessDocuments() {
        if (!this.uploadedFiles.length) {
            this.error = 'Please upload at least one document.';
            return;
        }

        this.isProcessing = true;
        this.error = null;
        this.processingResult = null;

        try {
            const fileIds = this.uploadedFiles.map(file => file.documentId);
            const result = await processDocuments({
                fileIds: fileIds,
                userInput: this.userInput
            });

            this.processingResult = result;
            this.uploadedFiles = []; // Reset for next upload
        } catch (error) {
            this.error = error.body?.message || 'An error occurred while processing the documents.';
        } finally {
            this.isProcessing = false;
        }
    }
}