// formFieldRemover.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FormFieldRemover extends LightningElement {
    @track errors = {};
    @track errorMessage = '';

    validateField(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        let isValid = true;
        let errorMessage = '';

        switch (field) {
            case 'firstName':
            case 'lastName':
                isValid = /^[a-zA-Z]{2,40}$/.test(value);
                errorMessage = 'Must be 2-40 letters only';
                break;
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                errorMessage = 'Invalid email format';
                break;
            case 'phone':
                isValid = value === '' || /^\+?[1-9]\d{1,14}$/.test(value);
                errorMessage = 'Invalid phone format';
                break;
            case 'address':
                isValid = value.length <= 200;
                errorMessage = 'Max 200 characters';
                break;
        }

        if (!isValid) {
            this.errors = { ...this.errors, [field]: errorMessage };
        } else {
            const { [field]: removed, ...rest } = this.errors;
            this.errors = rest;
        }
    }

    handleSubmit() {
        this.errorMessage = '';
        const allValid = [...this.template.querySelectorAll('input, textarea')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (allValid && Object.keys(this.errors).length === 0) {
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.handleReset();
        } else {
            this.errorMessage = 'Please correct the errors before submitting.';
        }
    }

    handleReset() {
        this.template.querySelectorAll('input, textarea').forEach(field => {
            field.value = '';
        });
        this.errors = {};
        this.errorMessage = '';
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}