// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessages = [];

    titleOptions = [
        { label: 'Select...', value: '' },
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
        { label: 'Select...', value: '' },
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
        this.formData[event.target.name] = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-radio-group').forEach(element => {
            element.value = null;
        });
        this.formData = {};
        this.errorMessages = [];
    }

    validateForm() {
        this.errorMessages = [];
        let isValid = true;

        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-radio-group').forEach(element => {
            if (element.required && !element.value) {
                this.errorMessages.push(`${element.label} is required.`);
                isValid = false;
            }
        });

        if (this.formData.birthdate) {
            const birthDate = new Date(this.formData.birthdate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 18) {
                this.errorMessages.push('Applicant must be older than 18 years.');
                isValid = false;
            }
        }

        if (this.formData.startDate && this.formData.endDate) {
            if (new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
                this.errorMessages.push('End Date must be after Start Date.');
                isValid = false;
            }
        }

        if (this.formData.postcode && !/^\d{4}$/.test(this.formData.postcode)) {
            this.errorMessages.push('Postcode must be 4 digits.');
            isValid = false;
        }

        return isValid;
    }
}