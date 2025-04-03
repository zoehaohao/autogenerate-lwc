// detailsForm.js
import { LightningElement, track } from 'lwc';

export default class DetailsForm extends LightningElement {
    @track fullName = '';
    @track dateOfBirth = '';
    @track startDate = '';
    @track endDate = '';
    @track errors = {};
    @track isFormValid = false;

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const value = field.value;

        this[fieldName] = value;

        switch (fieldName) {
            case 'fullName':
                this.validateFullName(value);
                break;
            case 'dateOfBirth':
                this.validateDateOfBirth(value);
                break;
            case 'startDate':
            case 'endDate':
                this.validateDateRange();
                break;
        }

        this.checkFormValidity();
    }

    validateFullName(value) {
        if (value.length < 2) {
            this.errors.fullName = 'Full name must be at least 2 characters long.';
        } else {
            delete this.errors.fullName;
        }
    }

    validateDateOfBirth(value) {
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            this.errors.dateOfBirth = 'You must be at least 18 years old.';
        } else {
            delete this.errors.dateOfBirth;
        }
    }

    validateDateRange() {
        if (this.startDate && this.endDate) {
            if (new Date(this.endDate) <= new Date(this.startDate)) {
                this.errors.endDate = 'End Date must be after Start Date.';
            } else {
                delete this.errors.startDate;
                delete this.errors.endDate;
            }
        }
    }

    checkFormValidity() {
        this.isFormValid = Object.keys(this.errors).length === 0 &&
            this.fullName && this.dateOfBirth && this.startDate && this.endDate;
    }

    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', {
                fullName: this.fullName,
                dateOfBirth: this.dateOfBirth,
                startDate: this.startDate,
                endDate: this.endDate
            });
        }
    }

    handleReset() {
        this.fullName = '';
        this.dateOfBirth = '';
        this.startDate = '';
        this.endDate = '';
        this.errors = {};
        this.isFormValid = false;
        this.template.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
    }
}