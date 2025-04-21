// addressForm.js
import { LightningElement, track } from 'lwc';

export default class AddressForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    @track isFormValid = false;

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateForm();
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate', 'endDate'];
        let isValid = true;
        let errors = [];

        requiredFields.forEach(field => {
            if (!this.formData[field]) {
                isValid = false;
                errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required.`);
            }
        });

        if (this.formData.zipCode && !/^\d{5}$/.test(this.formData.zipCode)) {
            isValid = false;
            errors.push('Zip Code must be 5 digits.');
        }

        if (this.formData.birthdate && new Date(this.formData.birthdate) >= new Date()) {
            isValid = false;
            errors.push('Birthdate must be in the past.');
        }

        if (this.formData.startDate && this.formData.endDate && new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
            isValid = false;
            errors.push('End Date must be after Start Date.');
        }

        this.isFormValid = isValid;
        this.errorMessage = errors.join(' ');
    }

    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please correct the errors before submitting.';
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errorMessage = '';
        this.isFormValid = false;
    }
}