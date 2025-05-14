// nameFieldRemover.js
import { LightningElement, track } from 'lwc';

export default class NameFieldRemover extends LightningElement {
    @track formData = {};
    @track errorMessage = '';

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
    }

    validateField(fieldName, value) {
        switch (fieldName) {
            case 'age':
                if (parseInt(value) < 18) {
                    this.errorMessage = 'Age must be 18 or older.';
                    return false;
                }
                break;
            case 'zipCode':
                if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    this.errorMessage = 'Invalid zip code format.';
                    return false;
                }
                break;
            case 'birthDate':
                const birthDate = new Date(value);
                const today = new Date();
                if (birthDate > today) {
                    this.errorMessage = 'Birth date cannot be in the future.';
                    return false;
                }
                break;
        }
        this.errorMessage = '';
        return true;
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('input');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            } else {
                isValid = this.validateField(input.id, input.value) && isValid;
            }
        });
        return isValid;
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            // Add logic to handle form submission
        } else {
            this.errorMessage = 'Please correct the errors in the form.';
        }
    }
}