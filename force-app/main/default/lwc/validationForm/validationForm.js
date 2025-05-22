// validationForm.js
import { LightningElement, track } from 'lwc';

export default class ValidationForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';

    titleOptions = [
        { label: 'Mr.', value: 'Mr.' },
        { label: 'Mrs.', value: 'Mrs.' },
        { label: 'Ms.', value: 'Ms.' },
        { label: 'Dr.', value: 'Dr.' }
    ];

    genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
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
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        }
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(element => {
            element.value = null;
        });
        this.formData = {};
        this.errorMessage = '';
    }

    validateForm() {
        let isValid = true;
        let errorMessages = [];

        if (!this.formData.firstName) {
            errorMessages.push('First Name is required');
            isValid = false;
        }

        if (!this.formData.birthdate) {
            errorMessages.push('Birthdate is required');
            isValid = false;
        } else {
            const age = this.calculateAge(this.formData.birthdate);
            if (age < 18) {
                errorMessages.push('Applicant must be at least 18 years old');
                isValid = false;
            }
        }

        if (!this.formData.addressLine1) {
            errorMessages.push('Address Line 1 is required');
            isValid = false;
        }

        if (!this.formData.suburb) {
            errorMessages.push('Suburb/City is required');
            isValid = false;
        }

        if (!this.formData.state) {
            errorMessages.push('State is required');
            isValid = false;
        }

        if (!this.formData.postcode) {
            errorMessages.push('Postcode is required');
            isValid = false;
        } else if (!/^\d{4}$/.test(this.formData.postcode)) {
            errorMessages.push('Postcode must be 4 digits');
            isValid = false;
        }

        if (!this.formData.country) {
            errorMessages.push('Country is required');
            isValid = false;
        }

        if (this.formData.startDate && this.formData.endDate) {
            if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
                errorMessages.push('Start Date must be earlier than End Date');
                isValid = false;
            }
        }

        this.errorMessage = errorMessages.join('. ');
        return isValid;
    }

    calculateAge(birthdate) {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
}