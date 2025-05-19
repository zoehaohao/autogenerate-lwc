// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errorMessages = [];
    @track hasErrors = false;

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
    }

    validateField(fieldName, value) {
        let errors = [];

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    errors.push(`${fieldName} is required`);
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!value) {
                    errors.push(`${fieldName} is required`);
                } else if (!this.isValidDate(value)) {
                    errors.push(`${fieldName} is not a valid date`);
                }
                break;
            case 'zipCode':
                if (!value.trim()) {
                    errors.push('Zip Code is required');
                } else if (!/^\d+$/.test(value)) {
                    errors.push('Zip Code must be numeric');
                }
                break;
        }

        if (fieldName === 'endDate' && this.formData.startDate) {
            if (new Date(value) <= new Date(this.formData.startDate)) {
                errors.push('End Date must be after Start Date');
            }
        }

        this.updateErrorMessages(fieldName, errors);
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    updateErrorMessages(fieldName, errors) {
        this.errorMessages = this.errorMessages.filter(error => !error.startsWith(fieldName));
        this.errorMessages = [...this.errorMessages, ...errors];
        this.hasErrors = this.errorMessages.length > 0;
    }

    handleSubmit() {
        this.validateAllFields();
        if (!this.hasErrors) {
            console.log('Form submitted:', this.formData);
            // Add logic to handle form submission
        }
    }

    validateAllFields() {
        Object.entries(this.formData).forEach(([fieldName, value]) => {
            this.validateField(fieldName, value);
        });
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errorMessages = [];
        this.hasErrors = false;
    }
}