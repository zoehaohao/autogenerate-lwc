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
                if (!this.isValidDate(fieldValue)) {
                    this.setFieldError(field, `Invalid date format`);
                } else {
                    this.clearFieldError(field);
                }
                break;
            case 'zipCode':
                if (!/^\d{5}(-\d{4})?$/.test(fieldValue)) {
                    this.setFieldError(field, 'Invalid zip code format');
                } else {
                    this.clearFieldError(field);
                }
                break;
        }

        if (fieldName === 'endDate') {
            const startDate = this.template.querySelector('#startDate').value;
            if (new Date(fieldValue) <= new Date(startDate)) {
                this.setFieldError(field, 'End Date must be after Start Date');
            }
        }
    }

    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    setFieldError(field, message) {
        field.setCustomValidity(message);
        field.reportValidity();
    }

    clearFieldError(field) {
        field.setCustomValidity('');
        field.reportValidity();
    }

    handleSubmit() {
        const isValid = [...this.template.querySelectorAll('input, select')].reduce((valid, field) => {
            this.validateField({ target: field });
            return valid && field.checkValidity();
        }, true);

        if (isValid) {
            this.errorMessage = '';
            // Implement form submission logic here
            console.log('Form submitted successfully');
        } else {
            this.errorMessage = 'Please correct the errors in the form.';
        }
    }
}