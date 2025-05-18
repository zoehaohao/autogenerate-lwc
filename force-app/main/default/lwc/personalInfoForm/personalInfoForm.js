// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            // Add logic to handle form submission
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errors = {};
    }

    handleCancel() {
        // Add logic to return to previous page
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
            case 'zipCode':
                if (!value.trim()) {
                    this.errors[fieldName] = 'Zip Code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    this.errors[fieldName] = 'Invalid Zip Code format';
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!value) {
                    this.errors[fieldName] = `${fieldName} is required`;
                }
                break;
        }

        if (fieldName === 'endDate' && this.formData.startDate) {
            if (new Date(value) <= new Date(this.formData.startDate)) {
                this.errors[fieldName] = 'End Date must be after Start Date';
            }
        }

        this.updateFieldValidation(field, this.errors[fieldName]);
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('input, select').forEach(field => {
            if (field.required && !field.value.trim()) {
                this.errors[field.id] = `${field.id} is required`;
                this.updateFieldValidation(field, this.errors[field.id]);
                isValid = false;
            }
        });

        if (this.formData.startDate && this.formData.endDate) {
            if (new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
                this.errors.endDate = 'End Date must be after Start Date';
                this.updateFieldValidation(this.template.querySelector('#endDate'), this.errors.endDate);
                isValid = false;
            }
        }

        return isValid;
    }

    updateFieldValidation(field, errorMessage) {
        if (errorMessage) {
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
            const errorElement = field.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            } else {
                const errorSpan = document.createElement('span');
                errorSpan.className = 'error-message';
                errorSpan.textContent = errorMessage;
                field.parentElement.appendChild(errorSpan);
            }
        } else {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
            const errorElement = field.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }
}