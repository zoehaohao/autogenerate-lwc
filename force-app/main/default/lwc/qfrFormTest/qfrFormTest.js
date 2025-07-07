export default class QfrFormTest extends LightningElement {
    currentPage = 1;
    totalPages = 2;

    formData = {
        name: '',
        address: ''
    };

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
        const inputs = [...this.template.querySelectorAll('lightning-input')];
        
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
