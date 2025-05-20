// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    @track isFormValid = false;

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;

        this.formData[fieldName] = fieldValue;
        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!fieldValue.trim()) {
                    this.errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
                }
                break;
            case 'birthdate':
                if (!fieldValue) {
                    this.errors[fieldName] = 'Birthdate is required';
                } else if (new Date(fieldValue) > new Date()) {
                    this.errors[fieldName] = 'Birthdate cannot be in the future';
                }
                break;
            case 'zipCode':
                if (!fieldValue.trim()) {
                    this.errors[fieldName] = 'Zip Code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(fieldValue)) {
                    this.errors[fieldName] = 'Invalid Zip Code format';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (!fieldValue) {
                    this.errors[fieldName] = `${fieldName === 'startDate' ? 'Start' : 'End'} Date is required`;
                } else if (this.formData.startDate && this.formData.endDate) {
                    if (new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
                        this.errors.endDate = 'End Date must be after Start Date';
                    }
                }
                break;
        }

        this.isFormValid = Object.values(this.errors).every(error => !error);
    }

    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', this.formData);
            // Add logic to handle form submission
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
        });
        this.formData = {};
        this.errors = {};
        this.isFormValid = false;
    }
}