// stateFieldRemover.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class StateFieldRemover extends LightningElement {
    @track formId = '';
    @track batchMode = false;
    @track confirmation = false;
    @track showResults = false;

    handlePreview() {
        if (!this.validateForm()) return;
        // Preview logic here
    }

    handleRemove() {
        if (!this.validateForm()) return;
        // Remove state field logic here
    }

    handleCancel() {
        // Cancel operation logic here
    }

    handleExport() {
        // Export log logic here
    }

    validateForm() {
        const inputFields = this.template.querySelectorAll('lightning-input');
        let isValid = true;

        inputFields.forEach(field => {
            if (field.required && !field.value) {
                field.reportValidity();
                isValid = false;
            }
        });

        if (!isValid) {
            this.showToast('Error', 'Please fill all required fields', 'error');
        }

        return isValid;
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