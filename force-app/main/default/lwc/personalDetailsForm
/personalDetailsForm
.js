// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track name = '';
    @track address = '';
    @track nameError = false;
    @track isSubmitting = false;

    get isSubmitDisabled() {
        return !this.name || this.nameError || this.isSubmitting;
    }

    get nameFieldClass() {
        return this.nameError ? 'error' : '';
    }

    handleNameChange(event) {
        this.name = event.target.value;
        this.validateName();
    }

    handleAddressChange(event) {
        this.address = event.target.value;
    }

    validateName() {
        if (!this.name || this.name.trim().length === 0) {
            this.nameError = true;
            return false;
        }
        this.nameError = false;
        return true;
    }

    handleSubmit() {
        if (!this.validateName()) {
            this.showToast('Error', 'Please fill in all required fields', 'error');
            return;
        }

        this.isSubmitting = true;
        
        try {
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.handleReset();
        } catch (error) {
            this.showToast('Error', 'An error occurred while submitting the form', 'error');
        } finally {
            this.isSubmitting = false;
        }
    }

    handleReset() {
        this.name = '';
        this.address = '';
        this.nameError = false;
    }

    handleCancel() {
        window.history.back();
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