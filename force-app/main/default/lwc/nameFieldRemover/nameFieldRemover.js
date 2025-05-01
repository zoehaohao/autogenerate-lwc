// nameFieldRemover.js
import { LightningElement, track } from 'lwc';

export default class NameFieldRemover extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track isSubmitDisabled = true;

    handleInputChange(event) {
        const { name, value } = event.target;
        this[name] = value;
        this.validateForm();
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input');
        const allValid = [...inputs].every(input => input.reportValidity());
        this.isSubmitDisabled = !allValid;
    }

    handleSubmit() {
        if (!this.isSubmitDisabled) {
            const submitEvent = new CustomEvent('submit', {
                detail: { firstName: this.firstName, lastName: this.lastName }
            });
            this.dispatchEvent(submitEvent);
        }
    }

    handleClear() {
        this.firstName = '';
        this.lastName = '';
        this.isSubmitDisabled = true;
        const inputs = this.template.querySelectorAll('lightning-input');
        inputs.forEach(input => {
            input.value = '';
            input.reportValidity();
        });
    }
}