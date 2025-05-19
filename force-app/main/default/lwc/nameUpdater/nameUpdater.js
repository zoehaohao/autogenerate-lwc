// nameUpdater.js
import { LightningElement, track } from 'lwc';

export default class NameUpdater extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track firstNameError = '';
    @track lastNameError = '';
    @track formMessage = '';
    @track formMessageClass = '';
    @track formMessageIcon = '';
    @track formMessageAlt = '';
    @track isSubmitDisabled = true;

    connectedCallback() {
        this.loadCurrentName();
    }

    loadCurrentName() {
        this.firstName = 'John';
        this.lastName = 'Doe';
    }

    handleBlur(event) {
        const { name, value } = event.target;
        this.validateField(name, value);
    }

    handleInput(event) {
        const { name, value } = event.target;
        this[name] = value;
        this.validateField(name, value);
        this.updateSubmitButton();
    }

    validateField(name, value) {
        const trimmedValue = value.trim();
        const isValid = /^[a-zA-Z-]{2,50}$/.test(trimmedValue);
        const errorMessage = isValid ? '' : `${name === 'firstName' ? 'First' : 'Last'} name must be 2-50 letters or hyphens.`;
        this[`${name}Error`] = errorMessage;
    }

    updateSubmitButton() {
        this.isSubmitDisabled = !this.firstName || !this.lastName || this.firstNameError || this.lastNameError;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.isSubmitDisabled) return;

        this.isSubmitDisabled = true;
        this.saveChanges();
    }

    saveChanges() {
        setTimeout(() => {
            const success = Math.random() > 0.5;
            if (success) {
                this.showMessage('Success! Your name has been updated.', 'success');
            } else {
                this.showMessage('Error: Unable to update your name. Please try again.', 'error');
            }
            this.isSubmitDisabled = false;
        }, 1000);
    }

    showMessage(message, type) {
        this.formMessage = message;
        this.formMessageClass = `acme-message acme-message_${type}`;
        this.formMessageIcon = type === 'success' ? 'utility:success' : 'utility:error';
        this.formMessageAlt = type === 'success' ? 'Success' : 'Error';
        setTimeout(() => {
            this.formMessage = '';
        }, 5000);
    }

    handleCancel() {
        this.loadCurrentName();
        this.firstNameError = '';
        this.lastNameError = '';
        this.formMessage = '';
        this.isSubmitDisabled = true;
    }
}