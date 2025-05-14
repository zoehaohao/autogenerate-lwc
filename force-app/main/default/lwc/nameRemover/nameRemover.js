// nameRemover.js
import { LightningElement, track } from 'lwc';

export default class NameRemover extends LightningElement {
    @track errorMessage = '';
    @track formData = {};

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;
        let isValid = true;

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                isValid = fieldValue.trim() !== '';
                break;
            case 'birthdate':
                isValid = this.validateAge(fieldValue);
                break;
            case 'zipCode':
                isValid = /^\d{5}(-\d{4})?$/.test(fieldValue);
                break;
            case 'startDate':
            case 'endDate':
                isValid = this.validateDateRange();
                break;
        }

        field.setCustomValidity(isValid ? '' : `Invalid ${fieldName}`);
        field.reportValidity();
        this.formData[fieldName] = fieldValue;
    }

    validateAge(birthdate) {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }

    validateDateRange() {
        const startDate = this.template.querySelector('#startDate').value;
        const endDate = this.template.querySelector('#endDate').value;
        if (startDate && endDate) {
            return new Date(endDate) > new Date(startDate);
        }
        return true;
    }

    handleSubmit() {
        const allValid = [...this.template.querySelectorAll('input, select')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (allValid) {
            this.errorMessage = '';
            console.log('Form submitted:', this.formData);
            // Add logic to handle form submission
        } else {
            this.errorMessage = 'Please fill all required fields correctly.';
        }
    }

    handleReset() {
        this.template.querySelector('form').reset();
        this.formData = {};
        this.errorMessage = '';
        [...this.template.querySelectorAll('input, select')].forEach(field => {
            field.setCustomValidity('');
            field.reportValidity();
        });
    }
}