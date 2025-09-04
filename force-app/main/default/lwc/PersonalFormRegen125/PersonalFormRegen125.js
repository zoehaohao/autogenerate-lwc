import { LightningElement, track } from 'lwc';

export default class PersonalFormRegen125 extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track address = '';
    @track showToast = false;
    @track toastMessage = '';
    @track toastVariant = 'success';

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
            const formData = {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone,
                address: this.address
            };
            console.log('Form submitted:', formData);
            this.showToastMessage('Form submitted successfully!', 'success');
        } else {
            this.showToastMessage('Please fill in all required fields.', 'error');
        }
    }

    handleReset() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.address = '';
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea');
        return [...inputs].reduce((valid, input) => {
            input.reportValidity();
            return valid && input.checkValidity();
        }, true);
    }

    showToastMessage(message, variant) {
        this.toastMessage = message;
        this.toastVariant = variant;
        this.showToast = true;
        setTimeout(() => {
            this.closeToast();
        }, 3000);
    }

    closeToast() {
        this.showToast = false;
    }

    get toastClass() {
        return `slds-notify slds-notify_toast slds-theme_${this.toastVariant}`;
    }

    get toastIcon() {
        return this.toastVariant === 'success' ? 'utility:success' : 'utility:error';
    }
}