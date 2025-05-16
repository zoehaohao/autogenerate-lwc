// formEditor.js
import { LightningElement, track } from 'lwc';

export default class FormEditor extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    };

    @track errorMessage = '';

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
    }

    validateField(fieldName, value) {
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    this.setFieldError(fieldName, `${fieldName === 'firstName' ? 'First' : 'Last'} Name is required`);
                } else {
                    this.clearFieldError(fieldName);
                }
                break;
            case 'zipCode':
                if (!value.trim()) {
                    this.setFieldError(fieldName, 'Zip Code is required');
                } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    this.setFieldError(fieldName, 'Invalid Zip Code format');
                } else {
                    this.clearFieldError(fieldName);
                }
                break;
            default:
                break;
        }
    }

    setFieldError(fieldName, message) {
        const field = this.template.querySelector(`#${fieldName}`);
        field.setCustomValidity(message);
        field.reportValidity();
    }

    clearFieldError(fieldName) {
        const field = this.template.querySelector(`#${fieldName}`);
        field.setCustomValidity('');
        field.reportValidity();
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please correct the errors in the form.';
        }
    }

    handleClear() {
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zipCode: ''
        };
        this.errorMessage = '';
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
            field.setCustomValidity('');
            field.reportValidity();
        });
    }

    validateForm() {
        let isValid = true;
        Object.keys(this.formData).forEach(fieldName => {
            this.validateField(fieldName, this.formData[fieldName]);
            if (this.template.querySelector(`#${fieldName}`).validity.valid === false) {
                isValid = false;
            }
        });
        return isValid;
    }
}