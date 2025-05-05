// agedCareRecipientFeedbackForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AgedCareRecipientFeedbackForm extends LightningElement {
    @track formData = {};
    ratingOptions = [
        { label: 'Excellent', value: 'Excellent' },
        { label: 'Good', value: 'Good' },
        { label: 'Average', value: 'Average' },
        { label: 'Poor', value: 'Poor' },
        { label: 'Very Poor', value: 'Very Poor' }
    ];

    handleInputChange(event) {
        const { name, value, checked } = event.target;
        this.formData[name] = event.target.type === 'checkbox' ? checked : value;
        this.autoSave();
    }

    autoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            console.log('Auto-saving:', this.formData);
        }, 2000);
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Feedback submitted successfully', 'success');
            this.resetForm();
        } else {
            this.showToast('Error', 'Please fill in all required fields', 'error');
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('.required-field')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        return allValid;
    }

    resetForm() {
        this.formData = {};
        this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-combobox').forEach(element => {
            element.value = undefined;
        });
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