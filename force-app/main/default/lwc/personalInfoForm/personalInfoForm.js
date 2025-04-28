// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track errorMessage = '';

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!fieldValue.trim()) {
                    this.setFieldError(field, `${fieldName} is required`);
                } else {
                    this.clearFieldError(field);
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!fieldValue) {
                    this.setFieldError(field, `${fieldName} is required`);
                } else if (!this.isValidDate(fieldValue)) {
                    this.setFieldError(field, `Invalid date format`);
                } else {
                    this.clearFieldError(field);
                }
                break;
            case 'zipCode':
                if (!fieldValue.trim()) {
                    this.setFieldError(field, 'Zip code is required');
                } else if (!this.isValidZipCode(fieldValue)) {
                    this.setFieldError(field, 'Invalid zip code format');
                } else {
                    this.clearFieldError(field);
                }
                break;
        }
    }

    setFieldError(field, message) {
        field.setCustomValidity(message);
        field.reportValidity();
    }

    clearFieldError(field) {
        field.setCustomValidity('');
        field.reportValidity();
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    isValidZipCode(zipCode) {
        return /^\d{5}(-\d{4})?$/.test(zipCode);
    }

    handleSubmit() {
        const form = this.template.querySelector('form');
        if (form.checkValidity()) {
            // Process form submission
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please fill out all required fields correctly.';
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
            this.clearFieldError(field);
        });
        this.errorMessage = '';
    }
}