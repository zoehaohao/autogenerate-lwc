import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MyPersonalForm1234 extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track address = '';

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

    handleAddressChange(event) {
        this.address = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.handleReset();
        } else {
            this.showToast('Error', 'Please fill in all required fields', 'error');
        }
    }

    handleReset() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.address = '';
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(element => {
            element.value = '';
        });
    }

    validateForm() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('lightning-input, lightning-textarea');
        
        inputFields.forEach(field => {
            if (field.required && !field.value) {
                isValid = false;
                field.reportValidity();
            }
            if (field.type === 'email' && field.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value)) {
                    isValid = false;
                    field.setCustomValidity('Please enter a valid email address');
                    field.reportValidity();
                }
            }
        });
        return isValid;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}