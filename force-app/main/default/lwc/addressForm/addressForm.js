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

    validateField(fieldName, value) {
        switch (fieldName) {
            case 'zipCode':
                if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    this.errorMessage = 'Invalid zip code format';
                } else {
                    this.errorMessage = '';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (this.formData.startDate && this.formData.endDate) {
                    if (new Date(this.formData.startDate) > new Date(this.formData.endDate)) {
                        this.errorMessage = 'End date must be after start date';
                    } else {
                        this.errorMessage = '';
                    }
                }
                break;
            default:
                break;
        }
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please fill all required fields correctly';
        }
    }

    handleReset() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errorMessage = '';
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate', 'endDate'];
        let isValid = true;

        requiredFields.forEach(field => {
            const input = this.template.querySelector(`[id="${field}"]`);
            if (!input.value) {
                isValid = false;
                input.classList.add('slds-has-error');
            } else {
                input.classList.remove('slds-has-error');
            }
        });

        return isValid && !this.errorMessage;
    }
}