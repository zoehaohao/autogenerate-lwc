import { LightningElement, track } from 'lwc';

export default class QfrFormTest extends LightningElement {
    currentPage = 1;

    @track formData = {
        name: ''
    };

    get currentPageString() {
        return this.currentPage.toString();
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.formData[field] = event.target.value;
    }

    validateForm() {
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

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }
}
