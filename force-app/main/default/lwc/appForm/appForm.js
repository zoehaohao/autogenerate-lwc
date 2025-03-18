import {
    LightningElement
} from 'lwc';
export default class AcmeForm extends LightningElement {
    handleSubmit(event) {
            event.preventDefault();
            if (this
            .validateForm()) { // Process form submission            console.log('Form submitted successfully');        }    }    validateForm() {        const inputs = this.template.querySelectorAll('input, select');        let isValid = true;        inputs.forEach(input => {            if (input.required && !input.value) {                this.showError(input, 'This field is required');                isValid = false;            } else if (input.id === 'zipCode' && !this.isValidZipCode(input.value)) {                this.showError(input, 'Please enter a valid 4-digit zip code');                isValid = false;            } else {                this.clearError(input);            }        });        return isValid;    }    isValidZipCode(zipCode) {        return /^[0-9]{4}$/.test(zipCode);    }    showError(input, message) {        input.setCustomValidity(message);        input.reportValidity();        input.classList.add('acme-form__input-error');    }    clearError(input) {        input.setCustomValidity('');        input.classList.remove('acme-form__input-error');    }}
