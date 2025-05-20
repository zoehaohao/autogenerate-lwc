// formFieldsValidator.js
import { LightningElement, track } from 'lwc';

export default class FormFieldsValidator extends LightningElement {
    @track formData = {};
    @track errors = {};

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const value = field.value;

        this.formData[fieldName] = value;
        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!value) {
                    this.errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
                }
                break;
            case 'birthdate':
                if (!value) {
                    this.errors[fieldName] = 'Birthdate is required';
                } else {
                    const age = this.calculateAge(new Date(value));
                    if (age < 18) {
                        this.errors[fieldName] = 'You must be at least 18 years old';
                    }
                }
                break;
            case 'zipCode':
                if (!value) {
                    this.errors[fieldName] = 'Zip Code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    this.errors[fieldName] = 'Invalid Zip Code format';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (!value) {
                    this.errors[fieldName] = `${fieldName === 'startDate' ? 'Start' : 'End'} Date is required`;
                } else if (this.formData.startDate && this.formData.endDate) {
                    if (new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
                        this.errors.endDate = 'End Date must be after Start Date';
                    }
                }
                break;
        }

        this.updateFieldValidationUI(field, this.errors[fieldName]);
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

    updateFieldValidationUI(field, errorMessage) {
        const fieldElement = field.closest('.slds-form-element');
        if (errorMessage) {
            fieldElement.classList.add('slds-has-error');
            const errorElement = fieldElement.querySelector('.slds-form-element__help');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            } else {
                const newErrorElement = document.createElement('div');
                newErrorElement.classList.add('slds-form-element__help');
                newErrorElement.textContent = errorMessage;
                fieldElement.appendChild(newErrorElement);
            }
        } else {
            fieldElement.classList.remove('slds-has-error');
            const errorElement = fieldElement.querySelector('.slds-form-element__help');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    handleSubmit() {
        this.template.querySelectorAll('input, select').forEach(field => {
            this.validateField({ target: field });
        });

        if (Object.values(this.errors).every(error => !error)) {
            console.log('Form submitted:', this.formData);
        } else {
            console.log('Form has errors:', this.errors);
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
            this.updateFieldValidationUI(field, '');
        });
        this.formData = {};
        this.errors = {};
    }
}