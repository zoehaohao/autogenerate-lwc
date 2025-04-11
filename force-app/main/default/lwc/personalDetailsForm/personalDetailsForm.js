// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    stateOptions = [
        { label: 'Choose a State', value: '' },
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        { label: 'Texas', value: 'TX' }
    ];

    validateField(event) {
        const field = event.target;
        const fieldName = field.dataset.id;
        const value = field.value;

        this.formData[fieldName] = value;
        this.errors[fieldName] = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
            case 'zipCode':
                if (!value) {
                    this.errors[fieldName] = `${field.label} is required`;
                }
                break;
            case 'birthdate':
                if (!this.isOver18(value)) {
                    this.errors[fieldName] = 'You must be over 18 years old';
                }
                break;
            case 'startDate':
            case 'endDate':
                this.validateDateRange();
                break;
        }

        field.setCustomValidity(this.errors[fieldName]);
        field.reportValidity();
    }

    isOver18(birthdate) {
        const today = new Date();
        const birthdateObj = new Date(birthdate);
        const age = today.getFullYear() - birthdateObj.getFullYear();
        const monthDiff = today.getMonth() - birthdateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateObj.getDate())) {
            age--;
        }
        return age >= 18;
    }

    validateDateRange() {
        const startDate = new Date(this.formData.startDate);
        const endDate = new Date(this.formData.endDate);
        if (startDate > endDate) {
            this.errors.endDate = 'End Date must be after Start Date';
            this.template.querySelector('[data-id="endDate"]').setCustomValidity(this.errors.endDate);
        } else {
            this.errors.endDate = '';
            this.template.querySelector('[data-id="endDate"]').setCustomValidity('');
        }
        this.template.querySelector('[data-id="endDate"]').reportValidity();
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Form submitted successfully', 'success');
        } else {
            this.showToast('Error', 'Please correct the errors in the form', 'error');
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        return allValid && Object.values(this.errors).every(error => !error);
    }

    handleClear() {
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(field => {
            field.value = '';
        });
        this.formData = {};
        this.errors = {};
    }

    handleCancel(event) {
        event.preventDefault();
        // Implement navigation logic here
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}