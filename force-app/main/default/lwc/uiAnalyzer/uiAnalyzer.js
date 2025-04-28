// uiAnalyzer.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class UiAnalyzer extends NavigationMixin(LightningElement) {
    @track analysisType = 'Basic Analysis';
    @track startDate;
    @track endDate;
    @track isExportDisabled = true;
    acceptedFormats = ['.csv', '.pdf', '.docx'];
    analysisOptions = [
        { label: 'Basic Analysis', value: 'Basic Analysis' },
        { label: 'Advanced Analysis', value: 'Advanced Analysis' },
        { label: 'Custom Analysis', value: 'Custom Analysis' }
    ];

    connectedCallback() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        this.startDate = thirtyDaysAgo.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.validateFiles(uploadedFiles);
    }

    validateFiles(files) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const invalidFiles = files.filter(file => file.size > maxSize);
        if (invalidFiles.length > 0) {
            this.showToast('Error', 'One or more files exceed the 10MB limit', 'error');
        } else {
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        }
    }

    handleAnalyze() {
        if (this.validateDateRange()) {
            // Perform analysis logic here
            this.isExportDisabled = false;
            this.showToast('Success', 'Analysis completed', 'success');
        }
    }

    handleExport() {
        // Export logic here
        this.showToast('Success', 'Report exported successfully', 'success');
    }

    handleDateChange(event) {
        const { name, value } = event.target;
        this[name] = value;
    }

    handleAnalysisTypeChange(event) {
        this.analysisType = event.detail.value;
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(element => {
            element.value = null;
        });
        this.analysisType = 'Basic Analysis';
        this.isExportDisabled = true;
    }

    validateDateRange() {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const today = new Date();

        if (start > end || end > today) {
            this.showToast('Error', 'Invalid date range', 'error');
            return false;
        }
        return true;
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

    navigateToDashboard() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/analytics-dashboard'
            }
        });
    }

    navigateToSettings() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/analyzer-settings'
            }
        });
    }

    openHelpGuide() {
        window.open('/analyzer-help', '_blank');
    }
}