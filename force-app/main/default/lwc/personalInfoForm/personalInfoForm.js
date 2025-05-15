// personalInfoForm.js
import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class PersonalInfoForm extends NavigationMixin(LightningElement) {
    @track formData = {};
    @track errors = {};

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
                    this.errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
                }
                break;
            case 'birthdate':
                if (!fieldValue) {
                    this.errors[fieldName] = 'Birthdate is required';
                } else if (new Date(fieldValue) >= new Date()) {
                    this.errors[fieldName] = 'Birthdate must be in the past';
                }
                break;
            case 'zipCode':
                if (!fieldValue) {
                    this.errors[fieldName] = 'Zip Code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(fieldValue)) {
                    this.errors[fieldName] = 'Invalid Zip Code format';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (!fieldValue) {
                    this.errors[fieldName] = `${fieldName === 'startDate' ? 'Start' : 'End'} Date is required`;
                }
                break;
        }

        field.setCustomValidity(this.errors[fieldName]);
        field.reportValidity();
    }

    validateDates() {
        const startDate = this.template.querySelector('#startDate').value;
        const endDate = this.template.querySelector('#endDate').value;

        if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
            this.errors.endDate = 'End Date must be after Start Date';
            this.template.querySelector('#endDate').setCustomValidity(this.errors.endDate);
        } else {
            this.errors.endDate = '';
            this.template.querySelector('#endDate').setCustomValidity('');
        }
        this.template.querySelector('#endDate').reportValidity();
    }

    handleSubmit() {
        this.template.querySelectorAll('input, select').forEach(field => this.validateField({ target: field }));
        this.validateDates();

        if (Object.values(this.errors).every(error => !error)) {
            console.log('Form submitted:', this.formData);
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
            field.setCustomValidity('');
            field.reportValidity();
        });
        this.formData = {};
        this.errors = {};
    }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/dashboard'
            }
        });
    }
}