// formUpdater.js
import { LightningElement, track } from 'lwc';

export default class FormUpdater extends LightningElement {
    @track formData = {
        firstName: '',
        lastName: '',
        birthdate: '',
        address: '',
        state: '',
        startDate: '',
        endDate: ''
    };
    @track errors = {};
    @track errorMessage = '';
    @track isFormValid = false;

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(event);
    }

    validateField(event) {
        const { id, value } = event.target;
        this.errors[id] = '';

        switch (id) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    this.errors[id] = `${id.charAt(0).toUpperCase() + id.slice(1)} is required`;
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!value) {
                    this.errors[id] = `${id.charAt(0).toUpperCase() + id.slice(1)} is required`;
                } else if (!this.isValidDate(value)) {
                    this.errors[id] = 'Invalid date format';
                }
                break;
        }

        if (id === 'endDate' && this.formData.startDate) {
            if (new Date(value) <= new Date(this.formData.startDate)) {
                this.errors[id] = 'End Date must be after Start Date';
            }
        }

        this.updateFormValidity();
    }

    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString) && !isNaN(Date.parse(dateString));
    }

    updateFormValidity() {
        this.isFormValid = Object.values(this.errors).every(error => !error) &&
            ['firstName', 'lastName', 'birthdate', 'startDate', 'endDate'].every(field => this.formData[field]);
        this.errorMessage = Object.values(this.errors).join('. ');
    }

    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', this.formData);
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {
            firstName: '',
            lastName: '',
            birthdate: '',
            address: '',
            state: '',
            startDate: '',
            endDate: ''
        };
        this.errors = {};
        this.errorMessage = '';
        this.isFormValid = false;
    }
}