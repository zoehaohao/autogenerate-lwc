// formFieldsLayout.js
import { LightningElement, track } from 'lwc';

export default class FormFieldsLayout extends LightningElement {
    @track formData = {};
    @track errors = {};

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        } else {
            console.error('Form has errors:', this.errors);
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errors = {};
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const value = field.value;

        this.formData[fieldName] = value;

        if (field.required && !value) {
            this.errors[fieldName] = `${fieldName} is required`;
        } else if (field.pattern && !new RegExp(field.pattern).test(value)) {
            this.errors[fieldName] = `Invalid ${fieldName} format`;
        } else {
            delete this.errors[fieldName];
        }

        this.updateFieldValidation(field, !this.errors[fieldName]);
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('input, select').forEach(field => {
            if (field.required && !field.value) {
                this.errors[field.id] = `${field.id} is required`;
                this.updateFieldValidation(field, false);
                isValid = false;
            }
        });
        return isValid;
    }

    updateFieldValidation(field, isValid) {
        if (isValid) {
            field.classList.remove('acme-form-fields-layout__input_error');
            field.classList.add('acme-form-fields-layout__input_valid');
        } else {
            field.classList.remove('acme-form-fields-layout__input_valid');
            field.classList.add('acme-form-fields-layout__input_error');
        }
    }
}