// requirementsAnalyzer.js
import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RequirementsAnalyzer extends LightningElement {
    @api recordId;
    @track analysisType = 'Standard';
    @track projectName = '';
    @track description = '';
    @track analysisResults;

    acceptedFormats = ['.pdf', '.doc', '.docx'];

    get analysisOptions() {
        return [
            { label: 'Standard', value: 'Standard' },
            { label: 'Advanced', value: 'Advanced' },
            { label: 'Custom', value: 'Custom' }
        ];
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.showToast('Success', `${uploadedFiles.length} file(s) uploaded successfully`, 'success');
    }

    handleAnalysisTypeChange(event) {
        this.analysisType = event.detail.value;
    }

    handleProjectNameChange(event) {
        this.projectName = event.detail.value;
    }

    handleDescriptionChange(event) {
        this.description = event.detail.value;
    }

    handleAnalyze() {
        if (this.validateFields()) {
            // Perform analysis logic here
            this.analysisResults = 'Analysis results would be displayed here.';
            this.showToast('Success', 'Analysis completed successfully', 'success');
        }
    }

    handleExport() {
        if (this.analysisResults) {
            // Export logic here
            this.showToast('Success', 'Results exported successfully', 'success');
        } else {
            this.showToast('Error', 'No results to export', 'error');
        }
    }

    handleSave() {
        if (this.validateFields()) {
            // Save logic here
            this.showToast('Success', 'Analysis saved successfully', 'success');
        }
    }

    handleCancel() {
        this.resetFields();
        this.showToast('Info', 'Form cleared', 'info');
    }

    validateFields() {
        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (!allValid) {
            this.showToast('Error', 'Please fill all required fields correctly', 'error');
        }
        return allValid;
    }

    resetFields() {
        this.analysisType = 'Standard';
        this.projectName = '';
        this.description = '';
        this.analysisResults = null;
        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea').forEach(field => {
            field.value = null;
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}