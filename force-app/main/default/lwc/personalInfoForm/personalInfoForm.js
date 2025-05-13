// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errors = {};
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const value = field.value;

        this.formData[fieldName] = value;
        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    this.errors[fieldName] = `${fieldName} is required`;
                }
                break;
            case 'birthdate':
                if (!this.isValidDate(value) || !this.isOver18(value)) {
                    this.errors[fieldName] = 'Must be a valid date and age 18 or older';
                }
                break;
            case 'zipCode':
                if (!/^\d{5}$/.test(value)) {
                    this.errors[fieldName] = 'Must be a 5-digit number';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (!this.isValidDate(value)) {
                    this.errors[fieldName] = 'Must be a valid date';
                }
                break;
        }

        if (fieldName === 'endDate' && this.formData.startDate) {
            if (new Date(value) <= new Date(this.formData.startDate)) {
                this.errors[fieldName] = 'End Date must be after Start Date';
            }
        }

        field.classList.toggle('acme-input_error', !!this.errors[fieldName]);
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('input[required], select[required]').forEach(field => {
            if (!field.value.trim()) {
                this.errors[field.id] = `${field.id} is required`;
                field.classList.add('acme-input_error');
                isValid = false;
            }
        });
        return isValid && Object.values(this.errors).every(error => !error);
    }

    isValidDate(dateString) {
        return !isNaN(new Date(dateString).getTime());
    }

    isOver18(dateString) {
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }
}