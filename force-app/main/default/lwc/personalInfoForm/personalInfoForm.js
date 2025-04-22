// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.clearForm();
        }
    }

    handleClear() {
        this.clearForm();
    }

    clearForm() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errorMessage = '';
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

        if (this.formData.zipCode && !/^\d{5}(-\d{4})?$/.test(this.formData.zipCode)) {
            isValid = false;
            errors.push('Zip Code must be 5 or 9 digits.');
        }

        if (this.formData.startDate && this.formData.endDate) {
            const start = new Date(this.formData.startDate);
            const end = new Date(this.formData.endDate);
            if (start >= end) {
                isValid = false;
                errors.push('End Date must be after Start Date.');
            }
        }

        this.errorMessage = errors.join(' ');
        return isValid;
    }
}