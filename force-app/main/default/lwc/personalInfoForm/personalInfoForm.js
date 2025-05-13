// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    @track isFormValid = false;

    stateOptions = [
        { label: 'Alabama', value: 'AL' },
        { label: 'Alaska', value: 'AK' },
        // Add more states here
    ];

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
        this.checkFormValidity();
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
                if (!/^\d{5}(\d{4})?$/.test(value)) {
                    this.errors[fieldName] = 'Zip Code must be 5 or 9 digits';
                }
                break;
        }

        if (fieldName === 'endDate' && this.formData.startDate) {
            if (new Date(value) <= new Date(this.formData.startDate)) {
                this.errors[fieldName] = 'End Date must be after Start Date';
            }
        }
    }

    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    checkFormValidity() {
        const requiredFields = ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate', 'endDate'];
        this.isFormValid = requiredFields.every(field => this.formData[field] && !this.errors[field]);
    }

    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', this.formData);
            // Add logic to handle form submission
            this.resetForm();
        }
    }

    resetForm() {
        this.formData = {};
        this.errors = {};
        this.isFormValid = false;
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
    }
}