// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const value = field.value;
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                isValid = /^[a-zA-Z]+$/.test(value);
                errorMessage = isValid ? '' : 'Only letters are allowed';
                break;
            case 'middleName':
                isValid = value === '' || /^[a-zA-Z]+$/.test(value);
                errorMessage = isValid ? '' : 'Only letters are allowed';
                break;
            case 'birthdate':
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                isValid = age >= 18 && birthDate <= today;
                errorMessage = isValid ? '' : 'Must be 18 or older and not a future date';
                break;
            case 'city':
                isValid = value === '' || /^[a-zA-Z\s]+$/.test(value);
                errorMessage = isValid ? '' : 'Only letters and spaces are allowed';
                break;
            case 'zipCode':
                isValid = /^\d{5}(-\d{4})?$/.test(value);
                errorMessage = isValid ? '' : 'Invalid zip code format';
                break;
            case 'startDate':
                const startDate = new Date(value);
                isValid = startDate >= new Date();
                errorMessage = isValid ? '' : 'Start date cannot be in the past';
                break;
            case 'endDate':
                const endDate = new Date(value);
                const startDateValue = this.template.querySelector('#startDate').value;
                if (startDateValue) {
                    const startDate = new Date(startDateValue);
                    const oneYearLater = new Date(startDate);
                    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
                    isValid = endDate > startDate && endDate <= oneYearLater;
                    errorMessage = isValid ? '' : 'End date must be after start date and within 1 year';
                }
                break;
        }

        this.formData[fieldName] = value;
        if (!isValid) {
            this.errors[fieldName] = errorMessage;
        } else {
            delete this.errors[fieldName];
        }
        this.updateFieldValidation(field, isValid, errorMessage);
    }

    updateFieldValidation(field, isValid, errorMessage) {
        if (!isValid) {
            field.classList.add('slds-has-error');
            const errorElement = field.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'slds-form-element__help error-message';
                errorDiv.textContent = errorMessage;
                field.parentElement.appendChild(errorDiv);
            }
        } else {
            field.classList.remove('slds-has-error');
            const errorElement = field.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    handleSubmit() {
        this.template.querySelectorAll('input, select').forEach(field => this.validateField({ target: field }));
        if (Object.keys(this.errors).length === 0) {
            console.log('Form submitted:', this.formData);
        } else {
            console.log('Form has errors:', this.errors);
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
            field.classList.remove('slds-has-error');
            const errorElement = field.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        });
        this.formData = {};
        this.errors = {};
    }
}