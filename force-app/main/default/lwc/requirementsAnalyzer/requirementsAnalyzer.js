// requirementsAnalyzer.js
import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RequirementsAnalyzer extends NavigationMixin(LightningElement) {
    @track projectName = '';
    @track analysisType = 'Standard';
    @track analysisResults = null;
    acceptedFormats = ['.doc', '.docx', '.pdf', '.txt'];
    analysisTypeOptions = [
        { label: 'Standard', value: 'Standard' },
        { label: 'Advanced', value: 'Advanced' },
        { label: 'Custom', value: 'Custom' }
    ];

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.validateFiles(uploadedFiles);
    }

    validateFiles(files) {
        const validFiles = files.filter(file => this.acceptedFormats.includes('.' + file.name.split('.').pop().toLowerCase()));
        if (validFiles.length !== files.length) {
            this.showToast('Error', 'Invalid file format. Please upload only .doc, .docx, .pdf, or .txt files.', 'error');
        }
    }

    handleProjectNameChange(event) {
        this.projectName = event.target.value;
    }

    handleAnalysisTypeChange(event) {
        this.analysisType = event.detail.value;
    }

    handleAnalyze() {
        if (this.validateForm()) {
            this.performAnalysis();
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-combobox')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (!allValid) {
            this.showToast('Error', 'Please fill in all required fields correctly.', 'error');
        }
        return allValid;
    }

    performAnalysis() {
        this.showToast('Success', 'Analysis started. This may take a few moments.', 'success');
    }

    handleClear() {
        this.projectName = '';
        this.analysisType = 'Standard';
        this.analysisResults = null;
        [...this.template.querySelectorAll('lightning-input, lightning-combobox')].forEach(field => {
            field.value = null;
        });
    }

    handleExport() {
        if (this.analysisResults) {
            this.showToast('Success', 'Exporting analysis results.', 'success');
        }
    }

    navigateToHistory() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'AnalysisHistory'
            },
        });
    }

    navigateToSettings() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'AnalyzerSettings'
            },
        });
    }

    navigateToHelp() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/n/AnalyzerHelp'
            },
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