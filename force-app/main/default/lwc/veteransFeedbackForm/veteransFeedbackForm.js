// veteransFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class VeteransFeedbackForm extends LightningElement {
    @track formData = {
        name: '',
        email: '',
        serviceBranch: '',
        feedback: ''
    };
    @track errorMessage = '';
    @track successMessage = '';

    serviceBranchOptions = [
        { label: 'Army', value: 'army' },
        { label: 'Navy', value: 'navy' },
        { label: 'Air Force', value: 'airForce' },
        { label: 'Marines', value: 'marines' },
        { label: 'Coast Guard', value: 'coastGuard' }
    ];

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.formData[field] = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            this.submitForm();
        }
    }

    validateForm() {
        this.errorMessage = '';
        let isValid = true;

        if (!this.formData.name.trim()) {
            this.errorMessage = 'Name is required.';
            isValid = false;
        } else if (!this.formData.email.trim()) {
            this.errorMessage = 'Email is required.';
            isValid = false;
        } else if (!this.isValidEmail(this.formData.email)) {
            this.errorMessage = 'Please enter a valid email address.';
            isValid = false;
        } else if (!this.formData.serviceBranch) {
            this.errorMessage = 'Service Branch is required.';
            isValid = false;
        } else if (!this.formData.feedback.trim()) {
            this.errorMessage = 'Feedback is required.';
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    submitForm() {
        this.successMessage = 'Thank you for your feedback!';
        this.formData = {
            name: '',
            email: '',
            serviceBranch: '',
            feedback: ''
        };
        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea').forEach(element => {
            element.value = '';
        });
    }
}