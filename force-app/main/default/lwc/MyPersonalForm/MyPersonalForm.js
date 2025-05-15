// MyPersonalForm.js
import { LightningElement, track } from 'lwc';

export default class MyPersonalForm extends LightningElement {
    @track formData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthdate: ''
    };
    @track errorMessage = '';
    @track successMessage = '';
    @track isSubmitDisabled = true;

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateForm();
    }

    validateForm() {
        this.errorMessage = '';
        this.isSubmitDisabled = false;

        if (!this.formData.firstName || !this.formData.lastName || !this.formData.email || !this.formData.birthdate) {
            this.isSubmitDisabled = true;
            return;
        }

        if (!this.validateEmail(this.formData.email)) {
            this.errorMessage = 'Please enter a valid email address.';
            this.isSubmitDisabled = true;
            return;
        }

        if (this.formData.phone && !this.validatePhone(this.formData.phone)) {
            this.errorMessage = 'Please enter a valid phone number.';
            this.isSubmitDisabled = true;
            return;
        }

        if (!this.validateAge(this.formData.birthdate)) {
            this.errorMessage = 'You must be at least 18 years old.';
            this.isSubmitDisabled = true;
            return;
        }
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePhone(phone) {
        return /^\+?[1-9]\d{1,14}$/.test(phone);
    }

    validateAge(birthdate) {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (!this.isSubmitDisabled) {
            this.successMessage = 'Form submitted successfully!';
            this.errorMessage = '';
            this.resetForm();
        }
    }

    resetForm() {
        this.formData = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            birthdate: ''
        };
        this.template.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        this.isSubmitDisabled = true;
    }
}