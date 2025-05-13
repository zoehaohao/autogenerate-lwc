// nameFieldRemover.js
import { LightningElement, track } from 'lwc';

export default class NameFieldRemover extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track errorMessages = [];
    @track showSuccessMessage = false;

    get isSubmitDisabled() {
        return !this.firstName || !this.lastName || this.hasErrors;
    }

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.name;
        const value = field.value;
        const isValid = field.checkValidity();

        if (!isValid) {
            this.errorMessages = [...this.errorMessages, `${fieldName}: ${field.validationMessage}`];
        } else {
            this[fieldName] = value;
            this.errorMessages = this.errorMessages.filter(error => !error.startsWith(fieldName));
        }
    }

    handleSubmit() {
        if (this.isSubmitDisabled) return;

        this.showSuccessMessage = true;
        setTimeout(() => {
            this.showSuccessMessage = false;
        }, 3000);

        this.handleReset();
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
        this.firstName = '';
        this.lastName = '';
        this.errorMessages = [];
    }
}