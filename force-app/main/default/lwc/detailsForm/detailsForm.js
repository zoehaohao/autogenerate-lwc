// detailsForm.js
import { LightningElement, track } from 'lwc';

export default class DetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        this.formData[field] = value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        }
    }

    validateForm() {
        const { firstName, lastName, email, phone, dateOfBirth, street, city, state, zipCode, startDate, endDate } = this.formData;

        if (!firstName || !lastName || !email || !phone || !dateOfBirth || !street || !city || !state || !zipCode || !startDate || !endDate) {
            this.errorMessage = 'Please fill in all required fields.';
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.errorMessage = 'Please enter a valid email address.';
            return false;
        }

        if (!this.isValidPhone(phone)) {
            this.errorMessage = 'Please enter a valid phone number.';
            return false;
        }

        if (!this.isOver18(dateOfBirth)) {
            this.errorMessage = 'Applicant must be over 18 years old.';
            return false;
        }

        if (!this.isValidDateRange(startDate, endDate)) {
            this.errorMessage = 'Start date must be earlier than end date.';
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^\d{10}$/.test(phone.replace(/\D/g, ''));
    }

    isOver18(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }

    isValidDateRange(startDate, endDate) {
        return new Date(startDate) < new Date(endDate);
    }
}