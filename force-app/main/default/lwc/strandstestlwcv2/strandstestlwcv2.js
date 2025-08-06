import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Strandstestlwcv2 extends LightningElement {
    @track providerName = '';
    @track role = '';
    @track phone = '';
    @track email = '';

    handleNameChange(event) {
        this.providerName = event.target.value;
    }

    handleRoleChange(event) {
        this.role = event.target.value;
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handleSubmit() {
        if (this.validateFields()) {
            // Here you would typically make an apex call to save the data
            this.showToast('Success', 'Contact details saved successfully', 'success');
            this.resetForm();
        } else {
            this.showToast('Error', 'Please fill all required fields with valid data', 'error');
        }
    }

    validateFields() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        return (
            this.providerName &&
            this.phone &&
            this.email &&
            emailRegex.test(this.email) &&
            phoneRegex.test(this.phone)
        );
    }

    resetForm() {
        this.providerName = '';
        this.role = '';
        this.phone = '';
        this.email = '';
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