// detailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DetailsForm extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track dateOfBirth = '';
    @track startDate = '';
    @track endDate = '';
    @track errors = {};
    @track errorMessages = [];

    get today() {
        return new Date().toISOString().split('T')[0];
    }

    handleInputBlur(event) {
        const { id, value } = event.target;
        this[id] = value;
        this.validateField(id, value);
    }

    validateField(fieldName, value) {
        this.errors[fieldName] = '';
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (value.length < 2) {
                    this.errors[fieldName] = `${fieldName} must be at least 2 characters long`;
                }
                break;
            case 'dateOfBirth':
                if (!this.isOver18(value)) {
                    this.errors[fieldName] = 'You must be at least 18 years old';
                }
                break;
            case 'startDate':
                if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
                    this.errors[fieldName] = 'Start date must be today or in the future';
                }
                break;
            case 'endDate':
                if (new Date(value) <= new Date(this.startDate)) {
                    this.errors[fieldName] = 'End date must be after the start date';
                }
                break;
        }
        this.updateErrorMessages();
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

    updateErrorMessages() {
        this.errorMessages = Object.values(this.errors).filter(error => error);
    }

    validateForm() {
        const fields = ['firstName', 'lastName', 'dateOfBirth', 'startDate', 'endDate'];
        fields.forEach(field => this.validateField(field, this[field]));
        return Object.values(this.errors).every(error => !error);
    }

    handleSubmit() {
        if (this.validateForm()) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Form submitted successfully',
                    variant: 'success'
                })
            );
            this.handleReset();
        }
    }

    handleReset() {
        this.template.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        this.firstName = '';
        this.lastName = '';
        this.dateOfBirth = '';
        this.startDate = '';
        this.endDate = '';
        this.errors = {};
        this.errorMessages = [];
    }
}