// addressForm.js
import { LightningElement, track } from 'lwc';

export default class AddressForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errors = {};
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const value = field.value;

        this.formData[fieldName] = value;
        this.errors[fieldName] = '';

        if (field.required && !value) {
            this.errors[fieldName] = `${fieldName} is required`;
        } else if (fieldName === 'zipCode' && !/^\d{5}(-\d{4})?$/.test(value)) {
            this.errors[fieldName] = 'Invalid zip code format';
        } else if (fieldName === 'endDate' && this.formData.startDate && new Date(value) <= new Date(this.formData.startDate)) {
            this.errors[fieldName] = 'End Date must be after Start Date';
        }

        field.setCustomValidity(this.errors[fieldName]);
        field.reportValidity();
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('input, select').forEach(element => {
            if (element.reportValidity() === false) {
                isValid = false;
            }
        });
        return isValid;
    }
}