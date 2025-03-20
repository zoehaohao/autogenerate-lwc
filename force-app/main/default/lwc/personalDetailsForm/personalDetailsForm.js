// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    stateOptions = [
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        { label: 'Texas', value: 'TX' }
    ];
    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }
    validateField(name, value) {
        switch (name) {
            case 'birthdate':
                this.validateAge(value);
                break;
            case 'zipCode':
                this.validateZipCode(value);
                break;
            case 'startDate':
            case 'endDate':
                this.validateDates();
                break;
        }
    }
    validateAge(birthdate) {
        const age = this.calculateAge(new Date(birthdate));
        if (age < 18) {
            this.errorMessage = 'Applicant must be at least 18 years old.';
        } else {
            this.errorMessage = '';
        }
    }
    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    validateZipCode(zipCode) {
        const zipCodePattern = /^\d{5}$/;
        if (!zipCodePattern.test(zipCode)) {
            this.errorMessage = 'Please enter a valid 5-digit zip code.';
        } else {
            this.errorMessage = '';
        }
    }
    validateDates() {
        const { startDate, endDate } = this.formData;
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            this.errorMessage = 'Start Date must be earlier than End Date.';
        } else {
            this.errorMessage = '';
        }
    }
    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }
    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate', 'endDate'];
        for (const field of requiredFields) {
            if (!this.formData[field]) {
                this.errorMessage = `Please fill in all required fields.`;
                return false;
            }
        }
        this.validateDates();
        return !this.errorMessage;
    }
}