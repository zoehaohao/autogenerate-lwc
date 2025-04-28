// formFieldRemover.js
import { LightningElement, track } from 'lwc';

export default class FormFieldRemover extends LightningElement {
    @track errors = {};
    @track isFormValid = false;

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const value = field.value;

        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (value.length < 2 || !/^[A-Za-z]+$/.test(value)) {
                    this.errors[fieldName] = `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters and contain only letters.`;
                }
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    this.errors[fieldName] = 'Please enter a valid email address.';
                }
                break;
            case 'phone':
                if (value && !/^\(\d{3}\)\s\d{3}-\d{4}$/.test(value)) {
                    this.errors[fieldName] = 'Please enter a valid phone number in the format (XXX) XXX-XXXX.';
                }
                break;
            case 'address':
                if (value.length > 200) {
                    this.errors[fieldName] = 'Address must not exceed 200 characters.';
                }
                break;
        }

        this.checkFormValidity();
    }

    checkFormValidity() {
        const form = this.template.querySelector('.slds-form');
        const formFields = form.querySelectorAll('input, textarea');
        this.isFormValid = true;

        formFields.forEach(field => {
            if (field.required && !field.value) {
                this.isFormValid = false;
            }
        });

        Object.values(this.errors).forEach(error => {
            if (error) {
                this.isFormValid = false;
            }
        });
    }

    handleSubmit() {
        if (this.isFormValid) {
            const formData = {};
            const form = this.template.querySelector('.slds-form');
            const formFields = form.querySelectorAll('input, textarea');

            formFields.forEach(field => {
                formData[field.id] = field.value;
            });

            console.log('Form submitted:', formData);
        }
    }

    handleReset() {
        const form = this.template.querySelector('.slds-form');
        const formFields = form.querySelectorAll('input, textarea');

        formFields.forEach(field => {
            field.value = '';
        });

        this.errors = {};
        this.isFormValid = false;
    }
}