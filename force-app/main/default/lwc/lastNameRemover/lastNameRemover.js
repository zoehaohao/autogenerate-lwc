// lastNameRemover.js
import { LightningElement, track } from 'lwc';

export default class LastNameRemover extends LightningElement {
    @track formData = {
        firstName: '',
        email: '',
        phone: '',
        age: null
    };
    @track showMessage = false;
    @track message = '';
    @track messageClass = '';
    @track messageIcon = '';

    handleInputChange(event) {
        const field = event.target.label.toLowerCase().replace(' ', '');
        this.formData[field] = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            this.showSuccessMessage('Form submitted successfully!');
            this.saveFormData();
            this.resetForm();
        } else {
            this.showErrorMessage('Please correct the errors in the form.');
        }
    }

    handleReset() {
        this.resetForm();
        this.showMessage = false;
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input');
        return [...inputs].reduce((valid, input) => {
            input.reportValidity();
            return valid && input.checkValidity();
        }, true);
    }

    resetForm() {
        this.formData = {
            firstName: '',
            email: '',
            phone: '',
            age: null
        };
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
    }

    saveFormData() {
        const formDataWithTimestamp = {
            ...this.formData,
            timestamp: new Date().toISOString(),
            submissionId: this.generateUniqueId()
        };
        console.log('Form data saved:', JSON.stringify(formDataWithTimestamp));
    }

    generateUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    showSuccessMessage(msg) {
        this.message = msg;
        this.messageClass = 'acme-message acme-message_success';
        this.messageIcon = 'utility:check';
        this.showMessage = true;
    }

    showErrorMessage(msg) {
        this.message = msg;
        this.messageClass = 'acme-message acme-message_error';
        this.messageIcon = 'utility:warning';
        this.showMessage = true;
    }
}