// personalDetailsForm.js
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    validateField(event) {
        const field = event.target;
        const fieldName = field.name;
        const fieldValue = field.value;

        if (field.required && !fieldValue) {
            this.showFieldError(field, `${fieldName} is required`);
        } else if (fieldName === 'zipCode' && !/^\d{5}(-\d{4})?$/.test(fieldValue)) {
            this.showFieldError(field, 'Please enter a valid ZIP code');
        } else {
            this.clearFieldError(field);
        }
    }

    showFieldError(field, message) {
        field.setCustomValidity(message);
        field.reportValidity();
    }

    clearFieldError(field) {
        field.setCustomValidity('');
        field.reportValidity();
    }

    handleSubmit() {
        const isValid = [...this.template.querySelectorAll('input')].reduce((valid, field) => {
            this.validateField({ target: field });
            return valid && field.checkValidity();
        }, true);

        if (isValid) {
            // Implement form submission logic here
            this.showToast('Success', 'Form submitted successfully', 'success');
        } else {
            this.showToast('Error', 'Please fill out all required fields correctly', 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}