// addressForm.js
import { LightningElement, track } from 'lwc';

export default class AddressForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    @track isFormValid = false;

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please correct the errors before submitting.';
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errorMessage = '';
        this.isFormValid = false;
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value.trim();

        this.formData[fieldName] = fieldValue;

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!fieldValue) {
                    field.setCustomValidity(`${fieldName} is required`);
                } else {
                    field.setCustomValidity('');
                }
                break;
            case 'zipCode':
                if (!/^\d{5}(\d{4})?$/.test(fieldValue)) {
                    field.setCustomValidity('Invalid zip code format');
                } else {
                    field.setCustomValidity('');
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!this.isValidDate(fieldValue)) {
                    field.setCustomValidity('Invalid date format');
                } else {
                    field.setCustomValidity('');
                }
                break;
        }

        field.reportValidity();
        this.validateForm();
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('input, select')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (allValid && this.formData.startDate && this.formData.endDate) {
            if (new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
                this.errorMessage = 'End Date must be after Start Date';
                allValid = false;
            }
        }

        this.isFormValid = allValid;
        return allValid;
    }

    isValidDate(dateString) {
        return !isNaN(new Date(dateString).getTime());
    }
}