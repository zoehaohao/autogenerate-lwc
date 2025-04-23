// addressForm.js
import { LightningElement, track } from 'lwc';

export default class AddressForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
    }

    validateField(fieldId, value) {
        switch (fieldId) {
            case 'firstName':
            case 'lastName':
            case 'zipCode':
                if (!value.trim()) {
                    this.setFieldError(fieldId, 'This field is required');
                } else {
                    this.clearFieldError(fieldId);
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!this.isValidDate(value)) {
                    this.setFieldError(fieldId, 'Please enter a valid date');
                } else {
                    this.clearFieldError(fieldId);
                }
                break;
        }

        if (fieldId === 'endDate' && this.formData.startDate) {
            if (new Date(value) <= new Date(this.formData.startDate)) {
                this.setFieldError(fieldId, 'End Date must be after Start Date');
            } else {
                this.clearFieldError(fieldId);
            }
        }
    }

    isValidDate(dateString) {
        return !isNaN(new Date(dateString).getTime());
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

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
            this.resetForm();
        } else {
            this.errorMessage = 'Please correct the errors in the form.';
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('input, select')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        return allValid;
    }

    resetForm() {
        this.formData = {};
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
        });
    }
}