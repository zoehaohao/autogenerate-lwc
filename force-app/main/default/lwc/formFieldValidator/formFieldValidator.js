// formFieldValidator.js
import { LightningElement, track } from 'lwc';
export default class FormFieldValidator extends LightningElement {
    @track formData = {};
    @track errors = {};
    handleSubmit() {
        this.validateAllFields();
        if (Object.keys(this.errors).length === 0) {
            console.log('Form submitted:', this.formData);
        } else {
            console.log('Form has errors:', this.errors);
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
        const fieldValue = field.value;
        this.formData[fieldName] = fieldValue;
        this.errors[fieldName] = '';
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!fieldValue.trim()) {
                    this.errors[fieldName] = `${fieldName} is required`;
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!this.isValidDate(fieldValue)) {
                    this.errors[fieldName] = 'Invalid date format';
                }
                break;
            case 'zipCode':
                if (!this.isValidZipCode(fieldValue)) {
                    this.errors[fieldName] = 'Invalid zip code format';
                }
                break;
        }
        if (fieldName === 'endDate') {
            this.validateDateRange();
        }
        this.updateFieldValidationUI(field, this.errors[fieldName]);
    }
    validateAllFields() {
        this.template.querySelectorAll('input, select').forEach(field => {
            this.validateField({ target: field });
        });
        this.validateDateRange();
    }
    validateDateRange() {
        const startDate = new Date(this.formData.startDate);
        const endDate = new Date(this.formData.endDate);
        if (startDate && endDate && endDate <= startDate) {
            this.errors.endDate = 'End Date must be after Start Date';
            this.updateFieldValidationUI(this.template.querySelector('#endDate'), this.errors.endDate);
        }
    }
    isValidDate(dateString) {
        return !isNaN(new Date(dateString).getTime());
    }
    isValidZipCode(zipCode) {
        return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipCode);
    }
    updateFieldValidationUI(field, errorMessage) {
        const formElement = field.closest('.slds-form-element');
        if (errorMessage) {
            formElement.classList.add('slds-has-error');
            let errorElement = formElement.querySelector('.slds-form-element__help');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.classList.add('slds-form-element__help');
                formElement.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
        } else {
            formElement.classList.remove('slds-has-error');
            const errorElement = formElement.querySelector('.slds-form-element__help');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }
}