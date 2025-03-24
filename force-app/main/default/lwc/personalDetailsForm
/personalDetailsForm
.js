// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    @track errorSummary;
    @track isSubmitDisabled = true;
    autoSaveInterval;

    genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
    ];

    maritalStatusOptions = [
        { label: 'Single', value: 'single' },
        { label: 'Married', value: 'married' },
        { label: 'Divorced', value: 'divorced' },
        { label: 'Widowed', value: 'widowed' }
    ];

    preferredContactOptions = [
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
        { label: 'Mail', value: 'mail' }
    ];

    connectedCallback() {
        this.setupAutoSave();
    }

    disconnectedCallback() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }

    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.handleSaveDraft();
        }, 300000);
    }

    handleInputValidation(event) {
        const fieldName = event.target.fieldName;
        const value = event.target.value;
        const required = event.target.required;
        
        this.formData[fieldName] = value;
        
        if (required && !value) {
            this.errors[fieldName] = 'This field is required';
        } else {
            delete this.errors[fieldName];
        }
        
        this.validateForm();
    }

    validateForm() {
        const errorCount = Object.keys(this.errors).length;
        this.isSubmitDisabled = errorCount > 0;
        
        if (errorCount > 0) {
            this.errorSummary = `Please correct ${errorCount} error${errorCount > 1 ? 's' : ''} in the form.`;
        } else {
            this.errorSummary = null;
        }
    }

    handleSubmit() {
        if (this.isSubmitDisabled) return;
        
        this.showToast('Success', 'Form submitted successfully', 'success');
    }

    handleSaveDraft() {
        localStorage.setItem('formDraft', JSON.stringify(this.formData));
        this.showToast('Success', 'Draft saved successfully', 'success');
    }

    handleClearForm() {
        this.formData = {};
        this.errors = {};
        this.errorSummary = null;
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}