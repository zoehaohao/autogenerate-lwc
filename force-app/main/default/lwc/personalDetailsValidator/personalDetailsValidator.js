// personalDetailsValidator.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsValidator extends LightningElement {
    @track dateOfBirth;
    @track startDate;
    @track endDate;
    @track errorMessage = '';

    handleInputBlur(event) {
        const { name, value } = event.target;
        this[name] = value;
        this.validateField(name, value);
    }

    validateField(fieldName, value) {
        switch (fieldName) {
            case 'dateOfBirth':
                this.validateAge(value);
                break;
            case 'startDate':
            case 'endDate':
                this.validateDateRange();
                break;
        }
    }

    validateAge(dob) {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            this.errorMessage = 'You must be at least 18 years old.';
        } else {
            this.errorMessage = '';
        }
    }

    validateDateRange() {
        if (this.startDate && this.endDate) {
            if (new Date(this.startDate) >= new Date(this.endDate)) {
                this.errorMessage = 'Start Date must be before End Date.';
            } else {
                this.errorMessage = '';
            }
        }
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Form is valid, proceed with submission
            console.log('Form submitted successfully');
        }
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });
        this.validateAge(this.dateOfBirth);
        this.validateDateRange();
        return isValid && !this.errorMessage;
    }

    handleReset() {
        const inputs = this.template.querySelectorAll('lightning-input');
        inputs.forEach(input => {
            input.value = '';
        });
        this.dateOfBirth = null;
        this.startDate = null;
        this.endDate = null;
        this.errorMessage = '';
    }

    handleHelpClick(event) {
        event.preventDefault();
        // Implement help functionality here
    }
}