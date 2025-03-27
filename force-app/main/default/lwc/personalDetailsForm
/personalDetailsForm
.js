// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    };

    @track errors = {
        firstName: '',
        lastName: '',
        zipCode: ''
    };

    @track formError = '';

    states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    get stateOptions() {
        return this.states.map(state => ({
            label: state,
            value: state
        }));
    }

    get isSubmitDisabled() {
        return !this.formData.firstName || 
               !this.formData.lastName || 
               !this.formData.zipCode ||
               Object.values(this.errors).some(error => error);
    }

    get firstNameClass() {
        return `input-field ${this.errors.firstName ? 'error' : ''}`;
    }

    get lastNameClass() {
        return `input-field ${this.errors.lastName ? 'error' : ''}`;
    }

    get zipCodeClass() {
        return `input-field ${this.errors.zipCode ? 'error' : ''}`;
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.formData = { ...this.formData, [name]: value };
        this.errors[name] = '';
        this.formError = '';
    }

    handleBlur(event) {
        const { name, value } = event.target;
        this.validateField(name, value);
    }

    validateField(name, value) {
        switch(name) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    this.errors[name] = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
                }
                break;
            case 'zipCode':
                if (!value) {
                    this.errors.zipCode = 'Zip code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    this.errors.zipCode = 'Invalid zip code format (12345 or 12345-6789)';
                }
                break;
        }
    }

    validateForm() {
        let isValid = true;
        
        Object.keys(this.formData).forEach(field => {
            if (['firstName', 'lastName', 'zipCode'].includes(field)) {
                this.validateField(field, this.formData[field]);
                if (this.errors[field]) {
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        } else {
            this.formError = 'Please correct the errors before submitting.';
        }
    }

    handleClear() {
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zipCode: ''
        };
        this.errors = {
            firstName: '',
            lastName: '',
            zipCode: ''
        };
        this.formError = '';
    }
}