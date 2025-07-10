import { LightningElement, track } from 'lwc';

export default class QfrFormTest extends LightningElement {
    currentPage = 1;
    totalPages = 2;

    @track formData = {
        name: '',
        addressLine1: '',
        addressLine2: '',
        country: ''
    };

    get countryOptions() {
        return [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'UK' },
            { label: 'Australia', value: 'AU' },
            { label: 'Other', value: 'OTHER' }
        ];
    }

    get currentPageString() {
        return this.currentPage.toString();
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get isPersonalInfoPage() {
        return this.currentPage === 1;
    }

    get isAddressPage() {
        return this.currentPage === 2;
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.formData[field] = event.target.value;
    }

    validateCurrentPage() {
        let isValid = true;
        const inputs = [...this.template.querySelectorAll('lightning-input, lightning-combobox')];
        
        inputs.forEach(input => {
            if (input.required && !input.value) {
                input.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.validateCurrentPage() && this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    handleSubmit() {
        if (this.validateCurrentPage()) {
            // Handle form submission
            console.log('Form submitted:', this.formData);
        }
    }
}
