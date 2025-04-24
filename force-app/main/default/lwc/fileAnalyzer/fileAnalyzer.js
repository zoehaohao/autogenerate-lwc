// fileAnalyzer.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FileAnalyzer extends LightningElement {
    @track files = [];
    @track analysisType = 'Basic';
    @track description = '';
    @track showResults = false;
    @track isAnalyzing = false;

    get acceptedFormats() {
        return ['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls'];
    }

    get analysisTypeOptions() {
        return [
            { label: 'Basic', value: 'Basic' },
            { label: 'Advanced', value: 'Advanced' },
            { label: 'Security', value: 'Security' }
        ];
    }

    get isAnalyzeDisabled() {
        return this.files.length === 0 || this.isAnalyzing;
    }

    get isCancelDisabled() {
        return !this.isAnalyzing;
    }

    get isDownloadDisabled() {
        return !this.showResults;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.files = [...this.files, ...uploadedFiles];
        this.showToast('Success', `${uploadedFiles.length} file(s) uploaded successfully`, 'success');
    }

    handleAnalysisTypeChange(event) {
        this.analysisType = event.detail.value;
    }

    handleDescriptionChange(event) {
        this.description = event.detail.value;
    }

    handleAnalyze() {
        if (this.files.length === 0) {
            this.showToast('Error', 'Please upload at least one file', 'error');
            return;
        }
        this.isAnalyzing = true;
        // Simulating analysis process
        setTimeout(() => {
            this.isAnalyzing = false;
            this.showResults = true;
            this.showToast('Success', 'Analysis completed', 'success');
        }, 3000);
    }

    handleCancel() {
        if (this.isAnalyzing) {
            this.isAnalyzing = false;
            this.showToast('Info', 'Analysis cancelled', 'info');
        }
    }

    handleDownload() {
        // Implement download logic here
        this.showToast('Success', 'Results downloaded', 'success');
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}