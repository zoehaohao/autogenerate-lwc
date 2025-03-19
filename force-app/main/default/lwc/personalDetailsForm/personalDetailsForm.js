// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
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
        const field = event.target.id;
        this.formData[field] = event.target.value;
        this.validateField(field, event.target.value);
    }

    validateField(field, value) {
        switch (field) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    this.errorMessage = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
                    return false;
                }
                break;
            case 'zipCode':
                if (!value.trim()) {
                    this.errorMessage = 'Zip code is required.';
                    return false;
                }
                if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    this.errorMessage = 'Invalid zip code format.';
                    return false;
                }
                break;
            default:
                break;
        }
        this.errorMessage = '';
        return true;
    }

    @api
    validateForm() {
        let isValid = true;
        ['firstName', 'lastName', 'zipCode'].forEach(field => {
            if (!this.validateField(field, this.formData[field])) {
                isValid = false;
            }
        });
        return isValid;
    }

    @api
    getFormData() {
        return this.formData;
    }
}