// personalInformationForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInformationForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
    }

    validateField(fieldId, value) {
        switch (fieldId) {
            case 'zipCode':
                if (!/^[0-9]{5}(?:-[0-9]{4})?$/.test(value)) {
                    this.setFieldError(fieldId, 'Invalid zip code format');
                } else {
                    this.clearFieldError(fieldId);
                }
                break;
            case 'endDate':
                if (this.formData.startDate && new Date(value) < new Date(this.formData.startDate)) {
                    this.setFieldError(fieldId, 'End Date must be equal to or later than Start Date');
                } else {
                    this.clearFieldError(fieldId);
                }
                break;
            default:
                if (this.template.querySelector(`#${fieldId}`).required && !value) {
                    this.setFieldError(fieldId, 'This field is required');
                } else {
                    this.clearFieldError(fieldId);
                }
        }
    }

    setFieldError(fieldId, message) {
        const field = this.template.querySelector(`#${fieldId}`);
        field.setCustomValidity(message);
        field.reportValidity();
    }

    clearFieldError(fieldId) {
        const field = this.template.querySelector(`#${fieldId}`);
        field.setCustomValidity('');
        field.reportValidity();
    }

    handleSubmit(event) {
        event.preventDefault();
        this.errorMessage = '';
        const allValid = [...this.template.querySelectorAll('input, select')].reduce((validSoFar, field) => {
            this.validateField(field.id, field.value);
            return validSoFar && field.checkValidity();
        }, true);

        if (allValid) {
            console.log('Form submitted:', this.formData);
            // Add logic to send data to server
        } else {
            this.errorMessage = 'Please correct the errors in the form.';
        }
    }

    handleClear() {
        this.template.querySelector('form').reset();
        this.formData = {};
        this.errorMessage = '';
        [...this.template.querySelectorAll('input, select')].forEach(field => {
            this.clearFieldError(field.id);
        });
    }
}