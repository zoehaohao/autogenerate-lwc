// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
    }

    handleSubmit(event) {
        event.preventDefault();
        this.errorMessage = '';

        if (!this.validateForm()) {
            return;
        }

        console.log('Form submitted:', this.formData);
    }

    validateForm() {
        const { firstName, lastName, email, dateOfBirth, startDate, endDate } = this.formData;

        if (!firstName || !lastName || !email || !dateOfBirth || !startDate || !endDate) {
            this.errorMessage = 'Please fill in all required fields.';
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.errorMessage = 'Please enter a valid email address.';
            return false;
        }

        if (!this.isOver18(dateOfBirth)) {
            this.errorMessage = 'Applicant must be over 18 years old.';
            return false;
        }

        if (!this.isStartDateBeforeEndDate(startDate, endDate)) {
            this.errorMessage = 'Start date must be earlier than end date.';
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isOver18(dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        return age >= 18;
    }

    isStartDateBeforeEndDate(startDate, endDate) {
        return new Date(startDate) < new Date(endDate);
    }
}