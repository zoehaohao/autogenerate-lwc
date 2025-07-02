import { LightningElement, track } from 'lwc';

export default class ProviderAppForm extends LightningElement {
    @track currentPage = 1;
    @track formData = {
        legalName: '',
        acn: '',
        abn: '',
        businessName: '',
        certificateFile: null,
        trustDeedFile: null
    };
    @track hasErrors = false;
    @track errorMessage = '';

    acceptedFormats = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];

    // Getters
    get currentPageString() {
        return String(this.currentPage);
    }

    get isPage1() {
        return this.currentPage === 1;
    }

    get showTrustDeedUpload() {
        return this.formData.abn && this.formData.abn.trim() !== '';
    }

    // Event Handlers
    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.formData[field] = event.target.value;
        this.validateField(field);
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        console.log('Files uploaded successfully: ' + JSON.stringify(uploadedFiles));
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            this.currentPage++;
        }
    }

    handleCancel() {
        // Reset form or navigate away
        this.dispatchEvent(new CustomEvent('cancel'));
    }

    // Validation Methods
    validateCurrentPage() {
        let isValid = true;
        let errors = [];

        if (this.isPage1) {
            // Validate required fields
            if (!this.formData.legalName) {
                errors.push('Legal Name is required');
                isValid = false;
            }
            if (!this.formData.acn) {
                errors.push('ACN/IAN/ICN is required');
                isValid = false;
            }
            if (!this.formData.abn) {
                errors.push('ABN is required');
                isValid = false;
            }

            // Validate ABN format
            if (this.formData.abn && !this.validateABN(this.formData.abn)) {
                errors.push('Invalid ABN format');
                isValid = false;
            }
        }

        if (!isValid) {
            this.hasErrors = true;
            this.errorMessage = errors.join('. ');
        } else {
            this.hasErrors = false;
            this.errorMessage = '';
        }

        return isValid;
    }

    validateField(fieldName) {
        // Individual field validation
        switch(fieldName) {
            case 'abn':
                return this.validateABN(this.formData.abn);
            // Add more field validations as needed
        }
        return true;
    }

    validateABN(abn) {
        // Basic ABN validation - 11 digits
        const abnRegex = /^\d{11}$/;
        return abnRegex.test(abn);
    }
}
