// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
    }

    validateField(fieldName, value) {
        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    this.errors[fieldName] = `${fieldName === 'firstName' ? 'First' : 'Last'} Name is required`;
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
                if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    this.errors[fieldName] = 'Invalid Zip Code format';
                }
                break;
        }
    }

    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    handleSubmit() {
        const allFields = this.template.querySelectorAll('.slds-input, .slds-select');
        let isValid = true;

        allFields.forEach(field => {
            const fieldName = field.id;
            const value = field.value;
            this.validateField(fieldName, value);
            if (this.errors[fieldName]) {
                isValid = false;
            }
        });

        if (isValid) {
            console.log('Form submitted:', this.formData);
            // Add logic to handle form submission
        } else {
            console.error('Form has errors:', this.errors);
        }
    }
}