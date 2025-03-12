// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        cityTown: '',
        state: '',
        zipCode: ''
    };

    handleInputChange(event) {
        const field = event.target.id;
        this.formData[field] = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Form submission logic here
            console.log('Form submitted:', this.formData);
        } else {
            // Show error message
            this.showToast('Error', 'Please fill all required fields and correct any errors.', 'error');
        }
    }

    validateForm() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.slds-input');
        
        inputFields.forEach(inputField => {
            if (inputField.required && !inputField.value) {
                isValid = false;
                this.showFieldError(inputField, 'This field is required');
            } else if (inputField.id === 'zipCode' && !this.isValidZipCode(inputField.value)) {
                isValid = false;
                this.showFieldError(inputField, 'Invalid Zip Code format');
            } else {
                this.clearFieldError(inputField);
            }
        });

        return isValid;
    }

    isValidZipCode(zipCode) {
        return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipCode);
    }

    showFieldError(field, message) {
        field.setCustomValidity(message);
        field.reportValidity();
    }

    clearFieldError(field) {
        field.setCustomValidity('');
        field.reportValidity();
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}