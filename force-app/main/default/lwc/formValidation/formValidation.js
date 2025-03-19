// formValidation.js
import { LightningElement, track } from 'lwc';

export default class FormValidation extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    @track isFormValid = false;

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
        this.validateForm();
    }

    validateField(id, value) {
        let isValid = true;
        let errorMsg = '';

        switch (id) {
            case 'title':
            case 'firstName':
            case 'lastName':
            case 'addressLine1':
            case 'suburb':
            case 'state':
            case 'country':
                isValid = value.trim() !== '';
                errorMsg = `${id.charAt(0).toUpperCase() + id.slice(1)} is required`;
                break;
            case 'birthdate':
                isValid = new Date(value) < new Date();
                errorMsg = 'Birthdate must be in the past';
                break;
            case 'postcode':
                isValid = /^\d{4}$/.test(value);
                errorMsg = 'Postcode must be exactly 4 digits';
                break;
            case 'startDate':
                isValid = new Date(value) > new Date();
                errorMsg = 'Start Date must be in the future';
                break;
            case 'endDate':
                isValid = new Date(value) > new Date(this.formData.startDate);
                errorMsg = 'End Date must be after Start Date';
                break;
        }

        const inputField = this.template.querySelector(`#${id}`);
        if (inputField) {
            inputField.setCustomValidity(isValid ? '' : errorMsg);
            inputField.reportValidity();
        }
    }

    validateForm() {
        const allInputs = this.template.querySelectorAll('.acme-formvalidation__input');
        this.isFormValid = [...allInputs].every(input => input.checkValidity());
    }

    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please correct the errors in the form before submitting.';
        }
    }

    handleReset() {
        this.formData = {};
        this.errorMessage = '';
        this.isFormValid = false;
        const allInputs = this.template.querySelectorAll('.acme-formvalidation__input');
        allInputs.forEach(input => {
            input.value = '';
            input.setCustomValidity('');
        });
    }
}