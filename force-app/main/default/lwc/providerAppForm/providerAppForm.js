import { LightningElement, track } from 'lwc';

export default class ProviderAppForm extends LightningElement {
    @track currentPage = 1;
    @track hasErrors = false;
    @track errorMessages = [];
    
    @track formData = {
        companyLegalName: '',
        acn: '',
        abn: '',
        businessName: '',
        streetAddress: '',
        suburb: '',
        state: '',
        postcode: ''
    };

    get currentPageString() {
        return String(this.currentPage);
    }

    get isPage1() {
        return this.currentPage === 1;
    }

    get nextButtonLabel() {
        return this.currentPage === 4 ? 'Submit' : 'Next';
    }

    get stateOptions() {
        return [
            { label: 'New South Wales', value: 'NSW' },
            { label: 'Victoria', value: 'VIC' },
            { label: 'Queensland', value: 'QLD' },
            { label: 'Western Australia', value: 'WA' },
            { label: 'South Australia', value: 'SA' },
            { label: 'Tasmania', value: 'TAS' },
            { label: 'Australian Capital Territory', value: 'ACT' },
            { label: 'Northern Territory', value: 'NT' }
        ];
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        this.formData[field] = value;
    }

    validatePage1() {
        let isValid = true;
        this.errorMessages = [];

        // Company Legal Name validation
        if (!this.formData.companyLegalName) {
            this.errorMessages.push('Company Legal Name is required');
            isValid = false;
        }

        // ACN validation
        if (!this.formData.acn) {
            this.errorMessages.push('ACN/IAN/ICN is required');
            isValid = false;
        }

        // ABN validation
        if (!this.formData.abn) {
            this.errorMessages.push('ABN is required');
            isValid = false;
        } else if (!/^\d{11}$/.test(this.formData.abn)) {
            this.errorMessages.push('ABN must be 11 digits');
            isValid = false;
        }

        // Address validation
        if (!this.formData.streetAddress) {
            this.errorMessages.push('Street Address is required');
            isValid = false;
        }
        if (!this.formData.suburb) {
            this.errorMessages.push('Suburb/Town is required');
            isValid = false;
        }
        if (!this.formData.state) {
            this.errorMessages.push('State/Territory is required');
            isValid = false;
        }
        if (!this.formData.postcode) {
            this.errorMessages.push('Postcode is required');
            isValid = false;
        } else if (!/^\d{4}$/.test(this.formData.postcode)) {
            this.errorMessages.push('Postcode must be 4 digits');
            isValid = false;
        }

        this.hasErrors = !isValid;
        return isValid;
    }

    handleNext() {
        if (this.currentPage === 1 && !this.validatePage1()) {
            return;
        }
        
        if (this.currentPage < 4) {
            this.currentPage++;
        } else {
            this.handleSubmit();
        }
    }

    handleCancel() {
        // Reset form and navigate away
        this.formData = {};
        this.currentPage = 1;
        // Add navigation logic here
    }

    handleSubmit() {
        // Add submission logic here
        console.log('Form submitted:', this.formData);
    }
}
