// fileManagementWizard.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FileManagementWizard extends LightningElement {
    @track currentStep = 1;
    @track documentType = '';
    @track uploadedFiles = [];
    @track currentPage = 1;
    @track isLoading = false;

    documentTypeOptions = [
        { label: 'Invoice', value: 'invoice' },
        { label: 'Contract', value: 'contract' },
        { label: 'Report', value: 'report' }
    ];

    acceptedFormats = ['.pdf', '.doc', '.docx', '.txt'];

    get progressValue() {
        return (this.currentStep / 3) * 100;
    }

    get isStep1() {
        return this.currentStep === 1;
    }

    get isStep2() {
        return this.currentStep === 2;
    }

    get isStep3() {
        return this.currentStep === 3;
    }

    get isFirstStep() {
        return this.currentStep === 1;
    }

    get isLastStep() {
        return this.currentStep === 3;
    }

    get isStepValid() {
        if (this.isStep1) {
            return this.documentType !== '';
        } else if (this.isStep2) {
            return this.uploadedFiles.length > 0;
        }
        return true;
    }

    get totalPages() {
        return Math.ceil(this.uploadedFiles.length / 10);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    handleDocumentTypeChange(event) {
        this.documentType = event.detail.value;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.uploadedFiles = [...this.uploadedFiles, ...uploadedFiles];
        this.showToast('Success', `${uploadedFiles.length} files uploaded successfully`, 'success');
    }

    handleFileDelete(event) {
        const fileId = event.detail;
        this.uploadedFiles = this.uploadedFiles.filter(file => file.documentId !== fileId);
    }

    handlePreviousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    handleNextStep() {
        if (this.currentStep < 3 && this.isStepValid) {
            this.currentStep++;
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    handleFinish() {
        if (this.isStepValid) {
            this.isLoading = true;
            // Simulating async operation
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'File management process completed', 'success');
                // Reset the wizard
                this.currentStep = 1;
                this.documentType = '';
                this.uploadedFiles = [];
                this.currentPage = 1;
            }, 2000);
        }
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