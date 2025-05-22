// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        } else {
            console.error('Form has errors:', this.errors);
        }
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const value = field.value;

        this.formData[fieldName] = value;
        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    this.errors[fieldName] = `${fieldName} is required`;
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!this.isValidDate(value)) {
                    this.errors[fieldName] = 'Invalid date format';
                }
                break;
            case 'zipCode':
                if (!this.isValidZipCode(value)) {
                    this.errors[fieldName] = 'Invalid zip code';
                }
                break;
        }

        if (fieldName === 'endDate' && this.formData.startDate) {
            if (new Date(value) <= new Date(this.formData.startDate)) {
                this.errors[fieldName] = 'End Date must be after Start Date';
            }
        }

        this.updateFieldValidation(field, this.errors[fieldName]);
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate', 'endDate'];
        let isValid = true;

        requiredFields.forEach(field => {
            const input = this.template.querySelector(`#${field}`);
            if (!input.value.trim()) {
                this.errors[field] = `${field} is required`;
                this.updateFieldValidation(input, this.errors[field]);
                isValid = false;
            }
        });

        return isValid && Object.values(this.errors).every(error => !error);
    }

    updateFieldValidation(field, errorMessage) {
        if (errorMessage) {
            field.setCustomValidity(errorMessage);
            field.reportValidity();
        } else {
            field.setCustomValidity('');
        }
    }

    isValidDate(dateString) {
        return !isNaN(new Date(dateString).getTime());
    }

    isValidZipCode(zipCode) {
        return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipCode);
    }
}