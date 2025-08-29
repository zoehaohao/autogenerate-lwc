import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MyPersonalFormSmall extends LightningElement {
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

    get isSubmitDisabled() {
        return !this.firstName || !this.lastName || !this.email;
    }

    handleSubmit() {
        if (this.isValidForm()) {
            const formData = {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone
            };

            this.dispatchEvent(new CustomEvent('formsubmit', {
                detail: formData
            }));

            this.showToast('Success', 'Form submitted successfully', 'success');
            this.resetForm();
        } else {
            this.showToast('Error', 'Please fill in all required fields', 'error');
        }
    }

    isValidForm() {
        return this.firstName && this.lastName && this.email;
    }

    resetForm() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}