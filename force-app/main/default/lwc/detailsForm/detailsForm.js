// detailsForm.js
import { LightningElement, track } from 'lwc';

export default class DetailsForm extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track dateOfBirth = '';
    @track startDate = new Date().toISOString().split('T')[0];
    @track endDate = '';
    @track email = '';
    @track phone = '';
    @track errorMessages = [];

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    get isSubmitDisabled() {
        return this.hasErrors || !this.firstName || !this.lastName || !this.dateOfBirth || !this.startDate || !this.endDate || !this.email;
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this[name] = value;
        this.validateField(name, value);
    }

    validateField(name, value) {
        this.errorMessages = this.errorMessages.filter(error => !error.startsWith(name));

        switch (name) {
            case 'firstName':
            case 'lastName':
                if (value.length < 2) {
                    this.errorMessages.push(`${name} must be at least 2 characters long`);
                }
                break;
            case 'dateOfBirth':
                if (!this.isOver18(value)) {
                    this.errorMessages.push('You must be 18 years or older');
                }
                break;
            case 'startDate':
            case 'endDate':
                if (this.startDate && this.endDate && new Date(this.startDate) >= new Date(this.endDate)) {
                    this.errorMessages.push('Start Date must be before End Date');
                }
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    this.errorMessages.push('Invalid email format');
                }
                break;
            case 'phone':
                if (value && !/^\(\d{3}\)\s\d{3}-\d{4}$/.test(value)) {
                    this.errorMessages.push('Invalid phone format');
                }
                break;
        }
    }

    isOver18(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age >= 18;
    }

    handleSubmit() {
        if (!this.isSubmitDisabled) {
            console.log('Form submitted');
        }
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
        this.firstName = '';
        this.lastName = '';
        this.dateOfBirth = '';
        this.startDate = new Date().toISOString().split('T')[0];
        this.endDate = '';
        this.email = '';
        this.phone = '';
        this.errorMessages = [];
    }

    handleCancel() {
        window.history.back();
    }
}