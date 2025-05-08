// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track errors = {};
    @track errorSummary = '';
    
    stateOptions = [
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        { label: 'Texas', value: 'TX' }
    ];

    validateField(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.errors[field] = '';

        switch(field) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    this.errors[field] = `${field === 'firstName' ? 'First' : 'Last'} name is required`;
                }
                break;
            case 'zipCode':
                if (!value.trim()) {
                    this.errors[field] = 'Zip code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    this.errors[field] = 'Invalid zip code format';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (!value) {
                    this.errors[field] = `${field === 'startDate' ? 'Start' : 'End'} date is required`;
                } else if (field === 'endDate') {
                    const startDate = this.template.querySelector('[data-field="startDate"]').value;
                    if (startDate && value < startDate) {
                        this.errors[field] = 'End date must be after start date';
                    }
                }
                break;
            case 'birthdate':
                if (!value) {
                    this.errors[field] = 'Birthdate is required';
                }
                break;
        }
        
        this.updateErrorSummary();
    }

    updateErrorSummary() {
        const errorMessages = Object.values(this.errors).filter(error => error);
        this.errorSummary = errorMessages.length ? errorMessages.join('. ') : '';
    }

    handleStateChange(event) {
        this.selectedState = event.target.value;
    }

    handleSubmit() {
        const inputs = this.template.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            const field = input.dataset.field;
            if (!input.value.trim()) {
                this.errors[field] = `${field} is required`;
                isValid = false;
            }
        });

        this.updateErrorSummary();

        if (isValid && !this.errorSummary) {
            // Form submission logic here
            console.log('Form submitted successfully');
        }
    }

    handleClear() {
        this.template.querySelectorAll('input, select').forEach(input => {
            input.value = '';
        });
        this.errors = {};
        this.errorSummary = '';
    }
}