// sampleUIForm.js
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SampleUIForm extends LightningElement {
    handleSubmit(event) {
        event.preventDefault();
        if (this.validateAllFields()) {
            // Form is valid, proceed with submission
            this.showToast('Success', 'Form submitted successfully', 'success');
            // Add your form submission logic here
        } else {
            this.showToast('Error', 'Please correct the errors in the form', 'error');
        }
    }

    handleReset() {
        this.template.querySelector('form').reset();
        this.resetValidation();
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.dataset.field;
        const errorDiv = this.template.querySelector(`#error-${fieldName}`);

        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'fullName':
                isValid = /^[A-Za-z\s]+$/.test(field.value);
                errorMessage = 'Please enter a valid name (alphabets and spaces only)';
                break;
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'age':
                const age = parseInt(field.value);
                isValid = age >= 18 && age <= 100;
                errorMessage = 'Age must be between 18 and 100';
                break;
            case 'gender':
                isValid = field.value !== '';
                errorMessage = 'Please select a gender';
                break;
            case 'comments':
                isValid = field.value.length <= 500;
                errorMessage = 'Comments must not exceed 500 characters';
                break;
        }

        if (!isValid) {
            field.classList.add('slds-has-error');
            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove('slds-hide');
        } else {
            field.classList.remove('slds-has-error');
            errorDiv.classList.add('slds-hide');
        }

        return isValid;
    }

    validateAllFields() {
        const fields = this.template.querySelectorAll('input, select, textarea');
        let isValid = true;
        fields.forEach(field => {
            if (!this.validateField({ target: field })) {
                isValid = false;
            }
        });
        return isValid;
    }

    resetValidation() {
        const fields = this.template.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.classList.remove('slds-has-error');
            const errorDiv = this.template.querySelector(`#error-${field.dataset.field}`);
            if (errorDiv) {
                errorDiv.classList.add('slds-hide');
            }
        });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}