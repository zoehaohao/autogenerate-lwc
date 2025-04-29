// addressForm.js
import { LightningElement, track } from 'lwc';

export default class AddressForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;

        this.formData[fieldName] = fieldValue;

        if (field.required && !fieldValue) {
            this.errors[fieldName] = `${fieldName} is required`;
        } else {
            delete this.errors[fieldName];
        }

        if (fieldName === 'endDate' && this.formData.startDate) {
            if (new Date(fieldValue) <= new Date(this.formData.startDate)) {
                this.errors[fieldName] = 'End Date must be after Start Date';
            }
        }

        this.updateFieldValidation(field);
    }

    updateFieldValidation(field) {
        if (this.errors[field.id]) {
            field.classList.add('acme-address-form__input_error');
            field.setAttribute('aria-invalid', 'true');
        } else {
            field.classList.remove('acme-address-form__input_error');
            field.removeAttribute('aria-invalid');
        }
    }

    handleSubmit() {
        this.validateAllFields();
        if (Object.keys(this.errors).length === 0) {
            console.log('Form submitted:', this.formData);
        } else {
            console.error('Form has errors:', this.errors);
        }
    }

    validateAllFields() {
        this.template.querySelectorAll('input, select').forEach(field => {
            if (field.required && !field.value) {
                this.errors[field.id] = `${field.id} is required`;
                this.updateFieldValidation(field);
            }
        });
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
        });
        this.formData = {};
        this.errors = {};
    }

    handleCancel() {
        // Implement navigation logic here
        console.log('Form cancelled');
    }
}