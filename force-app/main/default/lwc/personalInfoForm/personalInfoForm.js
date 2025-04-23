// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    @track isFormValid = false;

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;

        this.formData[fieldName] = fieldValue;
        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!fieldValue.trim()) {
                    this.errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
                }
                break;
            case 'birthdate':
                if (!this.isValidDate(fieldValue) || !this.isOver18(fieldValue)) {
                    this.errors[fieldName] = 'Must be a valid date and 18+ years old';
                }
                break;
            case 'zipCode':
                if (!/^\d{5}(-\d{4})?$/.test(fieldValue)) {
                    this.errors[fieldName] = 'Zip Code must be 5 or 9 digits';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (!this.isValidDate(fieldValue)) {
                    this.errors[fieldName] = 'Must be a valid date';
                } else if (fieldName === 'endDate' && new Date(fieldValue) <= new Date(this.formData.startDate)) {
                    this.errors[fieldName] = 'End Date must be after Start Date';
                }
                break;
        }

        this.checkFormValidity();
    }

    isValidDate(dateString) {
        return !isNaN(new Date(dateString).getTime());
    }

    isOver18(birthdate) {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }

    checkFormValidity() {
        this.isFormValid = Object.keys(this.errors).every(key => !this.errors[key]) &&
            ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate', 'endDate'].every(field => this.formData[field]);
    }

    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', this.formData);
        }
    }
}