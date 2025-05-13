// veteransFeedbackForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class VeteransFeedbackForm extends LightningElement {
    @track formData = {
        date: null,
        providerName: '',
        outletName: '',
        respondentType: ''
    };

    @track errors = {};
    today = new Date().toISOString().split('T')[0];

    handleInputChange(event) {
        const field = event.target.id || event.target.name;
        const value = event.target.value;
        this.formData[field] = value;
        this.validateField(field, value);
    }

    validateField(field, value) {
        this.errors[field] = '';
        
        switch(field) {
            case 'date':
                if (!value || new Date(value) > new Date()) {
                    this.errors[field] = 'Date cannot be in the future';
                }
                break;
            case 'providerName':
            case 'outletName':
                if (!value || value.length > 100) {
                    this.errors[field] = 'Field is required and cannot exceed 100 characters';
                }
                break;
            case 'respondentType':
                if (!value) {
                    this.errors[field] = 'Please select a respondent type';
                }
                break;
        }
    }

    validateForm() {
        let isValid = true;
        Object.keys(this.formData).forEach(field => {
            this.validateField(field, this.formData[field]);
            if (this.errors[field]) {
                isValid = false;
            }
        });
        return isValid;
    }

    handleSubmit() {
        if (this.validateForm()) {
            this.showToast('Success', 'Form submitted successfully', 'success');
        } else {
            this.showToast('Error', 'Please correct the errors before submitting', 'error');
        }
    }

    handleSaveDraft() {
        localStorage.setItem('veteransFeedbackDraft', JSON.stringify(this.formData));
        this.showToast('Success', 'Draft saved successfully', 'success');
    }

    handleClearForm() {
        if (confirm('Are you sure you want to clear the form?')) {
            this.formData = {
                date: null,
                providerName: '',
                outletName: '',
                respondentType: ''
            };
            this.errors = {};
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}