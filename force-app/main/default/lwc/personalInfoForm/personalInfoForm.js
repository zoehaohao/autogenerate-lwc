// personalInfoForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalInfoForm extends LightningElement {
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
    @track showSpinner = false;

    stateOptions = [
        { label: 'Alabama', value: 'AL' },
        { label: 'Alaska', value: 'AK' },
        // ... Add all other states here
        { label: 'Wyoming', value: 'WY' }
    ];

    get isSubmitDisabled() {
        return !this.formData.firstName || !this.formData.lastName || !this.formData.birthdate ||
               !this.formData.zipCode || !this.formData.startDate || !this.formData.endDate ||
               Object.keys(this.errors).length > 0;
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }

    validateField(name, value) {
        switch (name) {
            case 'firstName':
            case 'lastName':
                this.errors[name] = value ? '' : `${name} is required`;
                break;
            case 'birthdate':
                this.errors[name] = this.validateBirthdate(value);
                break;
            case 'zipCode':
                this.errors[name] = this.validateZipCode(value);
                break;
            case 'startDate':
            case 'endDate':
                this.errors[name] = this.validateDates();
                break;
        }
        this.errors = { ...this.errors };
    }

    validateBirthdate(value) {
        if (!value) return 'Birthdate is required';
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age < 18 ? 'You must be at least 18 years old' : '';
    }

    validateZipCode(value) {
        return /^\d{5}(-\d{4})?$/.test(value) ? '' : 'Please enter a valid 5-digit or 9-digit zip code';
    }

    validateDates() {
        const { startDate, endDate } = this.formData;
        if (!startDate || !endDate) return 'Both start and end dates are required';
        return new Date(startDate) < new Date(endDate) ? '' : 'End date must be after start date';
    }

    handleSubmit(event) {
        event.preventDefault();
        this.showSpinner = true;

        // Simulate API call
        setTimeout(() => {
            this.showSpinner = false;
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.handleClear();
        }, 2000);
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
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(element => {
            element.value = '';
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}
