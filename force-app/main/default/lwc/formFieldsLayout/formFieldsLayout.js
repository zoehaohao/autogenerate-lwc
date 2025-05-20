// formFieldsLayout.js
import { LightningElement, track } from 'lwc';

export default class FormFieldsLayout extends LightningElement {
    @track formData = {};
    @track errors = {};

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            // Add logic to handle form submission
        }
    }

    validateForm() {
        this.errors = {};
        let isValid = true;

        // Validate required fields
        ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate', 'endDate'].forEach(field => {
            const input = this.template.querySelector(`#${field}`);
            if (!input.value.trim()) {
                this.errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
                isValid = false;
            }
        });

        // Validate dates
        if (!this.validateDate('birthdate') || !this.validateDate('startDate') || !this.validateDate('endDate')) {
            isValid = false;
        }

        // Validate zip code
        if (!this.validateZipCode()) {
            isValid = false;
        }

        // Validate start and end dates
        const startDate = new Date(this.template.querySelector('#startDate').value);
        const endDate = new Date(this.template.querySelector('#endDate').value);
        if (endDate <= startDate) {
            this.errors.endDate = 'End Date must be after Start Date';
            isValid = false;
        }

        return isValid;
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const value = field.value.trim();

        if (!value && field.required) {
            this.errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        } else {
            delete this.errors[fieldName];
        }

        this.formData[fieldName] = value;
    }

    validateDate(fieldId) {
        const dateInput = this.template.querySelector(`#${fieldId}`);
        const dateValue = dateInput.value;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(dateValue)) {
            this.errors[fieldId] = 'Invalid date format. Use YYYY-MM-DD';
            return false;
        }

        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            this.errors[fieldId] = 'Invalid date';
            return false;
        }

        delete this.errors[fieldId];
        this.formData[fieldId] = dateValue;
        return true;
    }

    validateZipCode() {
        const zipCodeInput = this.template.querySelector('#zipCode');
        const zipCode = zipCodeInput.value.trim();
        const zipRegex = /^\d{5}(-\d{4})?$/;

        if (!zipRegex.test(zipCode)) {
            this.errors.zipCode = 'Invalid zip code format. Use #####-#### or #####';
            return false;
        }

        delete this.errors.zipCode;
        this.formData.zipCode = zipCode;
        return true;
    }
}