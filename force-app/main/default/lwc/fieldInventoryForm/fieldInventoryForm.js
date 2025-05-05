// fieldInventoryForm.js
import { LightningElement, track } from 'lwc';

export default class FieldInventoryForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    @track isFormValid = false;

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;

        this.formData[fieldName] = fieldValue;
        this.errors[fieldName] = '';

        if (field.required && !fieldValue) {
            this.errors[fieldName] = `${fieldName} is required`;
        } else if (fieldName === 'zipCode' && !/^\d+$/.test(fieldValue)) {
            this.errors[fieldName] = 'Zip Code must be numeric';
        } else if (fieldName === 'endDate' && this.formData.startDate && fieldValue <= this.formData.startDate) {
            this.errors[fieldName] = 'End Date must be after Start Date';
        }

        this.isFormValid = Object.values(this.errors).every(error => !error);
    }

    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', this.formData);
            // Add logic to send data to server
            this.handleClear();
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
        });
        this.formData = {};
        this.errors = {};
        this.isFormValid = false;
    }
}