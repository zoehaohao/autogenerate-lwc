// removeMiddleName.js
import { LightningElement, track } from 'lwc';

export default class RemoveMiddleName extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track firstNameError = '';
    @track lastNameError = '';
    @track formError = '';
    @track formSuccess = '';

    get isSubmitDisabled() {
        return !(this.firstName && this.lastName && !this.firstNameError && !this.lastNameError);
    }

    handleInputChange(event) {
        const field = event.target.id;
        this[field] = event.target.value;
        this.validateField(event);
    }

    validateField(event) {
        const field = event.target.id;
        const value = event.target.value;
        const errorField = `${field}Error`;
        this[errorField] = '';

        if (!value) {
            this[errorField] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        } else if (value.length < 2) {
            this[errorField] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least 2 characters`;
        } else if (value.length > 40) {
            this[errorField] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be 40 characters or less`;
        } else if (!/^[a-zA-Z\s\-]+$/.test(value)) {
            this[errorField] = `${field.charAt(0).toUpperCase() + field.slice(1)} must contain only letters, spaces, and hyphens`;
        }

        this.formError = '';
        this.formSuccess = '';
    }

    handleSubmit() {
        if (this.isSubmitDisabled) return;

        this.formSuccess = 'Form submitted successfully!';
        this.formError = '';
    }

    handleClear() {
        this.firstName = '';
        this.lastName = '';
        this.firstNameError = '';
        this.lastNameError = '';
        this.formError = '';
        this.formSuccess = '';
        this.template.querySelectorAll('input').forEach(input => {
            input.value = '';
            input.classList.remove('slds-has-error');
        });
    }
}