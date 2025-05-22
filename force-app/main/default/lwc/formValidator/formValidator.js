// formValidator.js
import { LightningElement, track } from 'lwc';
import { debounce } from 'c/utils';

export default class FormValidator extends LightningElement {
    @track formData = {};
    @track errors = {};
    @track hasErrors = false;

    connectedCallback() {
        this.validateFieldDebounced = debounce(this.validateField.bind(this), 300);
    }

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateFieldDebounced(event);
    }

    validateField(event) {
        const { id, value } = event.target;
        this.errors[id] = '';

        switch (id) {
            case 'firstName':
            case 'lastName':
                if (!/^[a-zA-Z]+$/.test(value)) {
                    this.errors[id] = 'Only letters are allowed';
                }
                break;
            case 'zipCode':
                if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    this.errors[id] = 'Invalid zip code format';
                }
                break;
            case 'startDate':
            case 'endDate':
                this.validateDates();
                break;
        }

        this.updateErrorState();
    }

    validateDates() {
        const birthdate = new Date(this.formData.birthdate);
        const startDate = new Date(this.formData.startDate);
        const endDate = new Date(this.formData.endDate);

        if (startDate < birthdate) {
            this.errors.startDate = 'Start date cannot be before birthdate';
        }

        if (endDate < startDate) {
            this.errors.endDate = 'End date cannot be before start date';
        }
    }

    updateErrorState() {
        this.hasErrors = Object.values(this.errors).some(error => error !== '');
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Form submission logic
            console.log('Form submitted:', this.formData);
        }
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('input, select').forEach(field => {
            if (field.required && !field.value) {
                this.errors[field.id] = 'This field is required';
                isValid = false;
            }
        });
        this.validateDates();
        this.updateErrorState();
        return isValid;
    }
}