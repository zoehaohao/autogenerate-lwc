// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        this.formData[field] = value;
        this.validateField(field, value);
    }

    validateField(field, value) {
        switch (field) {
            case 'firstName':
            case 'lastName':
            case 'address':
            case 'city':
            case 'state':
                if (!value) {
                    this.setFieldError(field, 'This field is required');
                } else {
                    this.clearFieldError(field);
                }
                break;
            case 'zipCode':
                if (!value) {
                    this.setFieldError(field, 'This field is required');
                } else if (!/^\d{5}$/.test(value)) {
                    this.setFieldError(field, 'Please enter a valid 5-digit zip code');
                } else {
                    this.clearFieldError(field);
                }
                break;
            case 'birthdate':
                if (!value) {
                    this.setFieldError(field, 'This field is required');
                } else {
                    const age = this.calculateAge(new Date(value));
                    if (age < 18) {
                        this.setFieldError(field, 'You must be at least 18 years old');
                    } else {
                        this.clearFieldError(field);
                    }
                }
                break;
            case 'startDate':
            case 'endDate':
                if (!value) {
                    this.setFieldError(field, 'This field is required');
                } else {
                    this.clearFieldError(field);
                }
                this.validateDateRange();
                break;
        }
    }

    setFieldError(field, message) {
        const inputElement = this.template.querySelector(`lightning-input[data-field="${field}"]`);
        if (inputElement) {
            inputElement.setCustomValidity(message);
            inputElement.reportValidity();
        }
    }

    clearFieldError(field) {
        const inputElement = this.template.querySelector(`lightning-input[data-field="${field}"]`);
        if (inputElement) {
            inputElement.setCustomValidity('');
            inputElement.reportValidity();
        }
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

    validateDateRange() {
        const startDate = new Date(this.formData.startDate);
        const endDate = new Date(this.formData.endDate);
        if (startDate && endDate && startDate > endDate) {
            this.setFieldError('endDate', 'End Date must be after Start Date');
        } else {
            this.clearFieldError('endDate');
        }
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please correct the errors before submitting.';
        }
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'birthdate', 'address', 'city', 'state', 'zipCode', 'startDate', 'endDate'];
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.formData[field]) {
                this.setFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.validateField(field, this.formData[field]);
                if (this.template.querySelector(`lightning-input[data-field="${field}"]`).validity.valid === false) {
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    handleClear() {
        this.formData = {};
        this.errorMessage = '';
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
            input.setCustomValidity('');
            input.reportValidity();
        });
    }

    handleCancel() {
        this.handleClear();
    }
}