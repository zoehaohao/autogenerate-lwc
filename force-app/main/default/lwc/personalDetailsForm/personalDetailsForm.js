// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    @track isFormInvalid = true;

    connectedCallback() {
        this.initializeForm();
    }

    initializeForm() {
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            birthdate: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            startDate: '',
            endDate: ''
        };
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;

        this.formData[fieldName] = fieldValue;

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!fieldValue.trim()) {
                    this.setFieldError(field, `${fieldName} is required`);
                } else {
                    this.clearFieldError(field);
                }
                break;
            case 'birthdate':
                if (!this.isValidDate(fieldValue)) {
                    this.setFieldError(field, 'Invalid date format');
                } else {
                    this.clearFieldError(field);
                }
                break;
            case 'zipCode':
                if (!/^\d{5}$/.test(fieldValue)) {
                    this.setFieldError(field, 'Invalid zip code format');
                } else {
                    this.clearFieldError(field);
                }
                break;
            case 'startDate':
            case 'endDate':
                if (!this.isValidDate(fieldValue)) {
                    this.setFieldError(field, 'Invalid date format');
                } else if (this.formData.startDate && this.formData.endDate) {
                    if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
                        this.setFieldError(field, 'End date must be after start date');
                    } else {
                        this.clearFieldError(field);
                    }
                } else {
                    this.clearFieldError(field);
                }
                break;
        }

        this.isFormInvalid = this.checkFormValidity();
    }

    isValidDate(dateString) {
        return !isNaN(new Date(dateString).getTime());
    }

    setFieldError(field, message) {
        field.setCustomValidity(message);
        field.reportValidity();
    }

    clearFieldError(field) {
        field.setCustomValidity('');
        field.reportValidity();
    }

    checkFormValidity() {
        const form = this.template.querySelector('form');
        return !form.checkValidity();
    }

    handleSubmit() {
        if (this.checkFormValidity()) {
            this.errorMessage = 'Please fill in all required fields correctly.';
        } else {
            this.errorMessage = '';
            console.log('Form submitted:', this.formData);
        }
    }

    handleClear() {
        this.initializeForm();
        this.errorMessage = '';
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
            this.clearFieldError(field);
        });
        this.isFormInvalid = true;
    }
}