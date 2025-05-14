// agedCareRecipientFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class AgedCareRecipientFeedbackForm extends LightningElement {
    @track formData = {
        name: '',
        email: '',
        phone: '',
        feedbackType: '',
        feedback: '',
        followUp: false
    };

    @track showSuccessMessage = false;
    @track errorMessage = '';
    @track isSubmitDisabled = true;

    handleInputChange(event) {
        const field = event.target.id;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.formData[field] = value;
        this.validateForm();
    }

    validateForm() {
        const { name, email, feedbackType, feedback } = this.formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = name.trim() !== '' &&
                        email.trim() !== '' &&
                        emailRegex.test(email) &&
                        feedbackType !== '' &&
                        feedback.trim() !== '';
        this.isSubmitDisabled = !isValid;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.isSubmitDisabled) return;

        this.errorMessage = '';
        this.showSuccessMessage = false;

        console.log('Form submitted:', this.formData);
        this.showSuccessMessage = true;
        this.resetForm();
    }

    resetForm() {
        this.formData = {
            name: '',
            email: '',
            phone: '',
            feedbackType: '',
            feedback: '',
            followUp: false
        };
        this.template.querySelectorAll('input, select, textarea').forEach(element => {
            element.value = '';
        });
        this.template.querySelector('input[type="checkbox"]').checked = false;
        this.isSubmitDisabled = true;
    }
}