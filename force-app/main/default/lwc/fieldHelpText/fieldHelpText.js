// fieldHelpText.js
import { LightningElement, track } from 'lwc';

export default class FieldHelpText extends LightningElement {
    @track formData = {
        name: '',
        email: '',
        phone: '',
        preferredContact: [],
        notes: ''
    };

    @track errors = {};
    @track isSubmitting = false;
    @track showTooltip = {
        phone: false
    };

    handleChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }

    handlePreferredContactChange(event) {
        const value = event.target.value;
        const isChecked = event.target.checked;

        if (isChecked) {
            this.formData.preferredContact.push(value);
        } else {
            this.formData.preferredContact = this.formData.preferredContact.filter(item => item !== value);
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        this.isSubmitting = true;

        const isValid = this.validateForm();

        if (isValid) {
            // Submit form data
            console.log('Submitting form data:', this.formData);
            // Perform any additional actions, such as API calls or data processing
            // ...

            // Reset form after successful submission
            this.resetForm();
        }

        this.isSubmitting = false;
    }

    handleCancel() {
        this.resetForm();
    }

    resetForm() {
        this.formData = {
            name: '',
            email: '',
            phone: '',
            preferredContact: [],
            notes: ''
        };
        this.errors = {};
    }

    validateForm() {
        this.errors = {};
        let isValid = true;

        if (!this.formData.name) {
            this.errors.name = 'Name is required';
            isValid = false;
        }

        if (!this.formData.email) {
            this.errors.email = 'Email is required';
            isValid = false;
        } else if (!this.isValidEmail(this.formData.email)) {
            this.errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!this.formData.preferredContact.length) {
            this.errors.preferredContact = 'Please select at least one preferred contact method';
            isValid = false;
        }

        return isValid;
    }

    validateField(fieldName, value) {
        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'name':
                if (!value) {
                    this.errors[fieldName] = 'Name is required';
                }
                break;
            case 'email':
                if (!value) {
                    this.errors[fieldName] = 'Email is required';
                } else if (!this.isValidEmail(value)) {
                    this.errors[fieldName] = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                if (value && !this.isValidPhoneNumber(value)) {
                    this.errors[fieldName] = 'Please enter a valid phone number';
                }
                break;
            default:
                break;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhoneNumber(phoneNumber) {
        const phoneRegex = /^\+?1?\s*\(\d{3}\)\s*\d{3}[-\s]?\d{4}$/;
        return phoneRegex.test(phoneNumber);
    }

    toggleTooltip(event) {
        const tooltipId = event.currentTarget.dataset.id;
        this.showTooltip[tooltipId] = !this.showTooltip[tooltipId];
    }
}
