// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
    }

    validateField(fieldId, value) {
        let errorMsg = '';
        switch (fieldId) {
            case 'postcode':
                if (!/^\d{4}$/.test(value)) {
                    errorMsg = 'Postcode must be 4 digits';
                }
                break;
            case 'endDate':
                if (this.formData.startDate && new Date(value) <= new Date(this.formData.startDate)) {
                    errorMsg = 'End Date must be after Start Date';
                }
                break;
        }
        this.setFieldError(fieldId, errorMsg);
    }

    setFieldError(fieldId, errorMsg) {
        const field = this.template.querySelector(`#${fieldId}`);
        if (field) {
            field.setCustomValidity(errorMsg);
            field.reportValidity();
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
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

    handleReset() {
        this.template.querySelector('form').reset();
        this.formData = {};
        this.errorMessage = '';
        [...this.template.querySelectorAll('input, select')].forEach(field => {
            field.setCustomValidity('');
        });
    }
}