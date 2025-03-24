// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        maritalStatus: '',
        nationality: '',
        ssn: '',
        driversLicense: ''
    };

    @track formErrors = {};
    @track isSubmitDisabled = true;

    genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
    ];

    maritalStatusOptions = [
        { label: 'Single', value: 'single' },
        { label: 'Married', value: 'married' },
        { label: 'Divorced', value: 'divorced' },
        { label: 'Widowed', value: 'widowed' }
    ];

    nationalityOptions = [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'United Kingdom', value: 'uk' }
    ];

    handleInputChange(event) {
        const field = event.target.label.toLowerCase().replace(' ', '');
        this.formData[field] = event.target.value;
        this.validateField(field, event.target.value);
        this.validateForm();
    }

    validateField(field, value) {
        this.formErrors[field] = '';

        switch(field) {
            case 'firstname':
            case 'lastname':
                if (!value) {
                    this.formErrors[field] = `${field} is required`;
                } else if (!/^[A-Za-z]+$/.test(value)) {
                    this.formErrors[field] = 'Only letters are allowed';
                }
                break;
            case 'ssn':
                if (!value) {
                    this.formErrors[field] = 'SSN is required';
                } else if (!/^\d{3}-\d{2}-\d{4}$/.test(value)) {
                    this.formErrors[field] = 'Invalid SSN format (XXX-XX-XXXX)';
                }
                break;
            case 'driverslicense':
                if (value && !/^[A-Za-z0-9]+$/.test(value)) {
                    this.formErrors[field] = 'Only alphanumeric characters allowed';
                }
                break;
            case 'nationality':
                if (!value) {
                    this.formErrors[field] = 'Nationality is required';
                }
                break;
        }
    }

    validateForm() {
        const requiredFields = ['firstname', 'lastname', 'gender', 'dateofbirth', 'nationality', 'ssn'];
        const isValid = requiredFields.every(field => {
            const value = this.formData[field];
            return value && !this.formErrors[field];
        });
        this.isSubmitDisabled = !isValid;
    }

    handleSave() {
        this.validateForm();
        if (Object.keys(this.formErrors).length === 0) {
            this.dispatchEvent(new CustomEvent('save', {
                detail: this.formData
            }));
        }
    }

    handleSubmit() {
        this.validateForm();
        if (!this.isSubmitDisabled) {
            this.dispatchEvent(new CustomEvent('submit', {
                detail: this.formData
            }));
        }
    }

    handleReset() {
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            gender: '',
            dateOfBirth: '',
            maritalStatus: '',
            nationality: '',
            ssn: '',
            driversLicense: ''
        };
        this.formErrors = {};
        this.isSubmitDisabled = true;
        
        this.template.querySelectorAll('lightning-input, lightning-radio-group, lightning-combobox')
            .forEach(element => {
                if (element.reset) {
                    element.reset();
                }
            });
    }

    handlePrivacyPolicy(event) {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('privacypolicy'));
    }

    handleTermsOfService(event) {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('termsofservice'));
    }
}