// requirementsAnalyzerDashboard.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RequirementsAnalyzerDashboard extends LightningElement {
    @track jobId = '';
    @track documentTitle = '';
    @track organization = '';
    @track documentType = 'Requirements';
    @track selectedAnalysisTypes = ['Basic'];

    documentTypeOptions = [
        { label: 'Requirements', value: 'Requirements' },
        { label: 'Specifications', value: 'Specifications' },
        { label: 'User Stories', value: 'User Stories' }
    ];

    analysisTypeOptions = [
        { label: 'Basic', value: 'Basic' },
        { label: 'Advanced', value: 'Advanced' },
        { label: 'Custom', value: 'Custom' }
    ];

    handleJobIdChange(event) {
        this.jobId = event.target.value;
        this.validateJobId();
    }

    handleDocumentTitleChange(event) {
        this.documentTitle = event.target.value;
        this.validateDocumentTitle();
    }

    handleOrganizationChange(event) {
        this.organization = event.target.value;
        this.validateOrganization();
    }

    handleDocumentTypeChange(event) {
        this.documentType = event.detail.value;
    }

    handleAnalysisTypeChange(event) {
        this.selectedAnalysisTypes = event.detail.value;
    }

    validateJobId() {
        const input = this.template.querySelector('lightning-input[label="Job ID"]');
        const isValid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(this.jobId);
        input.setCustomValidity(isValid ? '' : 'Please enter a valid UUID');
        input.reportValidity();
        return isValid;
    }

    validateDocumentTitle() {
        const input = this.template.querySelector('lightning-input[label="Document Title"]');
        const isValid = this.documentTitle.length > 0 && this.documentTitle.length <= 100;
        input.setCustomValidity(isValid ? '' : 'Document title is required and must be 100 characters or less');
        input.reportValidity();
        return isValid;
    }

    validateOrganization() {
        const input = this.template.querySelector('lightning-input[label="Organization"]');
        const isValid = this.organization.length > 0 && this.organization.length <= 50;
        input.setCustomValidity(isValid ? '' : 'Organization is required and must be 50 characters or less');
        input.reportValidity();
        return isValid;
    }

    validateForm() {
        return this.validateJobId() && this.validateDocumentTitle() && this.validateOrganization();
    }

    handleAnalyze() {
        if (this.validateForm()) {
            // Implement analysis logic here
            this.showToast('Success', 'Analysis started', 'success');
        } else {
            this.showToast('Error', 'Please correct the form errors', 'error');
        }
    }

    handleExport() {
        // Implement export logic here
        this.showToast('Success', 'Export initiated', 'success');
    }

    handleSave() {
        if (this.validateForm()) {
            // Implement save logic here
            this.showToast('Success', 'Analysis saved', 'success');
        } else {
            this.showToast('Error', 'Please correct the form errors', 'error');
        }
    }

    handleCancel() {
        // Implement cancel logic here
        this.showToast('Info', 'Operation cancelled', 'info');
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