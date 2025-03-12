// sampleForm.js
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SampleForm extends LightningElement {
    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            // Form submission logic here
            this.showToast('Success', 'Form submitted successfully', 'success');
        } else {
            this.showToast('Error', 'Please fill out all required fields', 'error');
        }
    }

    validateForm() {
        const allValid = [
            ...this.template.querySelectorAll('input[required]')
        ].reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);

        return allValid;
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