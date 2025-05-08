// exactFieldInventory.js
import { LightningElement, track } from 'lwc';

export default class ExactFieldInventory extends LightningElement {
    @track formData = {
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

    @track errors = {};

    stateOptions = [
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        { label: 'Texas', value: 'TX' }
    ];

    handleInputChange(event) {
        const field = event.target.id;
        const value = event.target.value;
        this.formData[field] = value;
        this.validateField(field, value);
    }

    validateField(field, value) {
        this.errors[field] = '';

        switch(field) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    this.errors[field] = `${field === 'firstName' ? 'First' : 'Last'} name is required`;
                }
                break;
            case 'zipCode':
                if (!value) {
                    this.errors.zipCode = 'Zip code is required';
                } else if (!/^\d{5}$/.test(value)) {
                    this.errors.zipCode = 'Zip code must be 5 digits';
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!value) {
                    this.errors[field] = 'Date is required';
                }
                break;
        }
    }

    validateForm() {
        let isValid = true;
        Object.keys(this.formData).forEach(field => {
            this.validateField(field, this.formData[field]);
            if (this.errors[field]) {
                isValid = false;
            }
        });
        return isValid;
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }

    handleClear() {
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
        this.errors = {};
    }
}