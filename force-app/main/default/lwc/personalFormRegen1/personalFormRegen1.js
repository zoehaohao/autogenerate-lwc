import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalFormRegen1 extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input');
        let isValid = true;
        
        inputs.forEach(input => {
            if (input.required && !input.value) {
                input.reportValidity();
                isValid = false;
            }
            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    input.setCustomValidity('Please enter a valid email address');
                    input.reportValidity();
                    isValid = false;
                } else {
                    input.setCustomValidity('');
                }
            }
        });
        
        return isValid;
    }

    handleSubmit() {
        if (this.validateForm()) {
            const formData = {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone
            };

            // Dispatch form submission event
            const submitEvent = new CustomEvent('formsubmit', {
                detail: formData,
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(submitEvent);

            // Show success toast
            this.showToast('Success', 'Form submitted successfully', 'success');

            // Reset form
            this.resetForm();
        }
    }

    resetForm() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        
        // Reset validity
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.setCustomValidity('');
        });
    }

    showToast(title, message, variant) {
        const toast = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toast);
    }
}