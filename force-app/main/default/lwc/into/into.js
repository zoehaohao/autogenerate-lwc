import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    currentPage = 1;
    totalPages = 1;

    @track formData = {
        lastName: ''
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
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.resetForm();
        }
    }

    resetForm() {
        this.formData = {
            lastName: ''
        };
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
