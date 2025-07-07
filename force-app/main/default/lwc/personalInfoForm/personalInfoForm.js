export default class PersonalInfoForm extends LightningElement {
    currentPage = 1;
    totalPages = 2;

    formData = {
        name: '',
        address: ''
    };

    // Getters for page visibility
    get isPageOne() {
        return this.currentPage === 1;
    }

    get isPageTwo() {
        return this.currentPage === 2;
    }

    get currentPageString() {
        return this.currentPage.toString();
    }

    // Navigation button visibility
    get showPrevButton() {
        return this.currentPage > 1;
    }

    get showNextButton() {
        return this.currentPage < this.totalPages;
    }

    get showSubmitButton() {
        return this.currentPage === this.totalPages;
    }

    // Event Handlers
    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.formData[field] = event.target.value;
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        }
    }

    handleSubmit() {
        if (this.validateCurrentPage()) {
            console.log('Form submitted:', this.formData);
            // Add submission logic here
        }
    }

    // Validation
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
}
