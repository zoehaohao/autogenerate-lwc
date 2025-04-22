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

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
    }

    validateField(event) {
        const { id, value } = event.target;
        this.errors[id] = '';

        if (event.target.required && !value) {
            this.errors[id] = `${id.charAt(0).toUpperCase() + id.slice(1)} is required`;
        } else if (id.includes('Date')) {
            if (!this.isValidDate(value)) {
                this.errors[id] = 'Invalid date format';
            }
        }

        this.template.querySelector(`#${id}`).classList.toggle('acme-form-updater__input--error', !!this.errors[id]);
    }

    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString) && !isNaN(Date.parse(dateString));
    }

    handleSubmit() {
        this.validateAllFields();
        if (Object.values(this.errors).every(error => !error)) {
            console.log('Form submitted:', this.formData);
        } else {
            console.log('Form has errors:', this.errors);
        }
    }

    validateAllFields() {
        this.template.querySelectorAll('input, select').forEach(field => {
            this.validateField({ target: field });
        });
    }
}