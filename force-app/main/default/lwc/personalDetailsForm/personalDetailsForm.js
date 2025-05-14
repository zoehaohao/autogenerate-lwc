// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
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
                const age = this.calculateAge(new Date(fieldValue));
                if (age < 18) {
                    this.setFieldError(field, 'You must be at least 18 years old');
                } else {
                    this.clearFieldError(field);
                }
                break;
            case 'zipCode':
                if (!/^\d{5}$/.test(fieldValue)) {
                    this.setFieldError(field, 'Zip Code must be 5 digits');
                } else {
                    this.clearFieldError(field);
                }
                break;
            case 'startDate':
            case 'endDate':
                this.validateDateRange();
                break;
        }
    }

    validateDateRange() {
        const startDate = this.template.querySelector('#startDate').value;
        const endDate = this.template.querySelector('#endDate').value;
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            this.errorMessage = 'End Date must be later than Start Date';
        } else {
            this.errorMessage = '';
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

    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Submit form logic here
            console.log('Form submitted successfully');
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('input')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (!allValid) {
            this.errorMessage = 'Please fill out all required fields correctly.';
        } else {
            this.errorMessage = '';
        }

        return allValid;
    }

    handleClear() {
        this.template.querySelector('form').reset();
        this.errorMessage = '';
        [...this.template.querySelectorAll('input')].forEach(input => {
            this.clearFieldError(input);
        });
    }
}