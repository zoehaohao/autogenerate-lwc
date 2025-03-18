// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    @track isSubmitDisabled = true;

    connectedCallback() {
        this.template.addEventListener('blur', this.validateField.bind(this));
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            this.submitForm();
        }
    }

    handleReset() {
        if (confirm('Are you sure you want to reset the form?')) {
            this.template.querySelector('form').reset();
            this.formData = {};
            this.errors = {};
            this.isSubmitDisabled = true;
        }
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;

        this.formData[fieldName] = fieldValue;
        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
            case 'address':
                if (!fieldValue.trim()) {
                    this.errors[fieldName] = `${field.labels[0].textContent.replace('*', '')} is required`;
                }
                break;
            case 'dateOfBirth':
                if (!this.isAdult(fieldValue)) {
                    this.errors[fieldName] = 'You must be 18 years or older';
                }
                break;
            case 'email':
                if (!this.isValidEmail(fieldValue)) {
                    this.errors[fieldName] = 'Please enter a valid email address';
                }
                break;
            case 'phoneNumber':
                if (fieldValue && !this.isValidPhoneNumber(fieldValue)) {
                    this.errors[fieldName] = 'Please enter a valid phone number';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (this.formData.startDate && this.formData.endDate) {
                    if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
                        this.errors.endDate = 'End Date must be later than Start Date';
                    }
                }
                break;
            case 'gender':
                if (!fieldValue) {
                    this.errors[fieldName] = 'Please select a gender';
                }
                break;
        }

        this.isSubmitDisabled = !this.validateForm();
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'email', 'startDate', 'endDate', 'gender', 'address'];
        return requiredFields.every(field => this.formData[field] && !this.errors[field]) && Object.keys(this.errors).every(field => !this.errors[field]);
    }

    isAdult(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age >= 18;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhoneNumber(phone) {
        return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone);
    }

    submitForm() {
        const formattedData = {
            ...this.formData,
            dateOfBirth: this.formatDate(this.formData.dateOfBirth),
            startDate: this.formatDate(this.formData.startDate),
            endDate: this.formatDate(this.formData.endDate),
            phoneNumber: this.formData.phoneNumber ? this.formatPhoneNumber(this.formData.phoneNumber) : ''
        };

        console.log('Submitting form data:', formattedData);
    }

    formatDate(dateString) {
        return new Date(dateString).toISOString().split('T')[0];
    }

    formatPhoneNumber(phoneNumber) {
        return phoneNumber.replace(/\D/g, '');
    }
}