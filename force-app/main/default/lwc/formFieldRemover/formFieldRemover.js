// formFieldRemover.js
import { LightningElement, track } from 'lwc';

export default class FormFieldRemover extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    @track isFormValid = false;

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;

        this.formData[fieldName] = fieldValue;

        if (field.validity.valid) {
            field.classList.remove('slds-has-error');
        } else {
            field.classList.add('slds-has-error');
        }

        this.validateForm();
    }

    validateForm() {
        const allFields = this.template.querySelectorAll('.slds-input, .slds-select');
        this.isFormValid = [...allFields].every(field => field.checkValidity());
    }

    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please fill all required fields correctly.';
        }
    }

    handleReset() {
        this.template.querySelector('form').reset();
        this.formData = {};
        this.errorMessage = '';
        this.isFormValid = false;
        this.template.querySelectorAll('.slds-has-error').forEach(field => {
            field.classList.remove('slds-has-error');
        });
    }
}