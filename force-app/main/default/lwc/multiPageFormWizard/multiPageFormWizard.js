import { LightningElement, track } from 'lwc';

export default class MultiPageFormWizard extends LightningElement {
    @track currentPage = 1;
    @track formData = {
        solvencyConcern: '',
        futureSolvency: '',
        operationalLoss: '',
        // Add other form fields here
    };
    @track errorMessages = [];

    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    get currentPageString() {
        return String(this.currentPage);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === 5;
    }

    get nextButtonLabel() {
        return this.isLastPage ? 'Submit' : 'Next';
    }

    get isPage1() {
        return this.currentPage === 1;
    }

    get isNextDisabled() {
        return !this.validateCurrentPage();
    }

    handleFieldChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }

    validateCurrentPage() {
        this.errorMessages = [];
        let isValid = true;

        if (this.isPage1) {
            if (!this.formData.solvencyConcern) {
                this.errorMessages.push('Please answer the solvency concern question');
                isValid = false;
            }
            if (!this.formData.futureSolvency) {
                this.errorMessages.push('Please answer the future solvency question');
                isValid = false;
            }
            if (!this.formData.operationalLoss) {
                this.errorMessages.push('Please answer the operational loss question');
                isValid = false;
            }
        }

        return isValid;
    }

    validateField(fieldName, value) {
        switch(fieldName) {
            case 'solvencyConcern':
            case 'futureSolvency':
            case 'operationalLoss':
                return this.validateRequiredField(fieldName, value);
            default:
                return true;
        }
    }

    validateRequiredField(fieldName, value) {
        return value && value.trim() !== '';
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            if (this.isLastPage) {
                this.handleSubmit();
            } else {
                this.currentPage++;
            }
        }
    }

    handleSubmit() {
        // Implement form submission logic
        console.log('Form submitted:', this.formData);
    }
}
