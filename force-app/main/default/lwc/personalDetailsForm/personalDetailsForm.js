// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    titleOptions = [
        { label: 'Mr', value: 'Mr' },
        { label: 'Mrs', value: 'Mrs' },
        { label: 'Ms', value: 'Ms' },
        { label: 'Dr', value: 'Dr' }
    ];

    genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' }
    ];

    stateOptions = [
        { label: 'New South Wales', value: 'NSW' },
        { label: 'Victoria', value: 'VIC' },
        { label: 'Queensland', value: 'QLD' },
        { label: 'Western Australia', value: 'WA' },
        { label: 'South Australia', value: 'SA' },
        { label: 'Tasmania', value: 'TAS' },
        { label: 'Australian Capital Territory', value: 'ACT' },
        { label: 'Northern Territory', value: 'NT' }
    ];

    countryOptions = [
        { label: 'Australia', value: 'Australia' },
        { label: 'New Zealand', value: 'New Zealand' }
    ];

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }

    validateField(name, value) {
        this.errors[name] = '';

        switch (name) {
            case 'firstName':
            case 'lastName':
            case 'addressLine1':
            case 'suburb':
                if (!value.trim()) {
                    this.errors[name] = `${name} is required`;
                }
                break;
            case 'postcode':
                if (!/^\d{4}$/.test(value)) {
                    this.errors[name] = 'Postcode must be 4 digits';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (!value) {
                    this.errors[name] = `${name} is required`;
                } else if (name === 'endDate' && this.formData.startDate && new Date(value) <= new Date(this.formData.startDate)) {
                    this.errors[name] = 'End Date must be after Start Date';
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

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        } else {
            console.error('Form has errors:', this.errors);
        }
    }

    handleReset() {
        this.template.querySelector('form').reset();
        this.formData = {};
        this.errors = {};
    }
}