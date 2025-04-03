// detailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DetailsForm extends LightningElement {
    @track errors = {};

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const value = field.value;

        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (value.length < 2) {
                    this.errors[fieldName] = `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters long`;
                }
                break;
            case 'dateOfBirth':
                const age = this.calculateAge(new Date(value));
                if (age < 18) {
                    this.errors[fieldName] = 'You must be at least 18 years old';
                }
                break;
            case 'startDate':
            case 'endDate':
                this.validateDateRange();
                break;
        }

        this.errors = { ...this.errors };
    }

    validateDateRange() {
        const startDate = new Date(this.template.querySelector('#startDate').value);
        const endDate = new Date(this.template.querySelector('#endDate').value);

        if (startDate >= endDate) {
            this.errors.startDate = 'Start Date must be before End Date';
            this.errors.endDate = 'End Date must be after Start Date';
        } else {
            this.errors.startDate = '';
            this.errors.endDate = '';
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

    handleSubmit(event) {
        event.preventDefault();
        const allFields = this.template.querySelectorAll('.acme-input');
        let isValid = true;

        allFields.forEach(field => {
            if (!field.checkValidity()) {
                field.reportValidity();
                isValid = false;
            }
            this.validateField({ target: field });
        });

        if (isValid && Object.values(this.errors).every(error => error === '')) {
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.handleReset();
        } else {
            this.showToast('Error', 'Please correct the errors in the form', 'error');
        }
    }

    handleReset() {
        this.template.querySelector('form').reset();
        this.errors = {};
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}