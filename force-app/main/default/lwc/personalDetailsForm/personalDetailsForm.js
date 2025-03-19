// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        } else {
            console.error('Form has errors:', this.errors);
        }
    }

    handleReset() {
        this.template.querySelector('form').reset();
        this.formData = {};
        this.errors = {};
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;

        this.formData[fieldName] = fieldValue;

        switch(fieldName) {
            case 'firstName':
            case 'lastName':
                this.errors[fieldName] = fieldValue ? '' : 'This field is required.';
                break;
            case 'email':
                this.errors[fieldName] = this.validateEmail(fieldValue) ? '' : 'Please enter a valid email address.';
                break;
            case 'phone':
                this.errors[fieldName] = this.validatePhone(fieldValue) ? '' : 'Please enter a valid phone number (XXX) XXX-XXXX.';
                break;
            case 'dob':
                this.errors[fieldName] = this.validateDate(fieldValue) ? '' : 'Please enter a valid date.';
                break;
            case 'zipCode':
                this.errors[fieldName] = this.validateZipCode(fieldValue) ? '' : 'Please enter a valid zip code.';
                break;
            default:
                break;
        }

        field.setCustomValidity(this.errors[fieldName]);
        field.reportValidity();
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('input, select').forEach(field => {
            if (field.required && !field.value) {
                this.errors[field.id] = 'This field is required.';
                isValid = false;
            }
        });
        return isValid && Object.values(this.errors).every(error => error === '');
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePhone(phone) {
        return /^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone);
    }

    validateDate(date) {
        return !isNaN(Date.parse(date));
    }

    validateZipCode(zipCode) {
        return /^\d{5}(-\d{4})?$/.test(zipCode);
    }
}