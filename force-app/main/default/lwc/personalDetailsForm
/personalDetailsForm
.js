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
        driversLicense: '',
        email: '',
        phone: '',
        preferredContact: '',
        newsletter: false,
        altPhone: '',
        socialMedia: '',
        skype: '',
        fax: ''
    };

    @track errors = {};
    @track formErrors = [];

    nationalityOptions = [
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'Australia', value: 'AU' }
    ];

    handleFieldChange(event) {
        const field = event.target.dataset.field || event.target.id;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.formData[field] = value;
        this.validateField(event);
    }

    validateField(event) {
        const field = event.target.dataset.field || event.target.id;
        const value = this.formData[field];
        
        delete this.errors[field];

        switch(field) {
            case 'firstName':
            case 'lastName':
                if (!value || value.trim() === '') {
                    this.errors[field] = `${field === 'firstName' ? 'First' : 'Last'} name is required`;
                }
                break;
            case 'email':
                if (!value) {
                    this.errors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    this.errors.email = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                if (!value) {
                    this.errors.phone = 'Phone number is required';
                } else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(value)) {
                    this.errors.phone = 'Please enter phone in (XXX) XXX-XXXX format';
                }
                break;
            case 'ssn':
                if (!value) {
                    this.errors.ssn = 'SSN is required';
                } else if (!/^\d{9}$/.test(value.replace(/\D/g, ''))) {
                    this.errors.ssn = 'Please enter a valid 9-digit SSN';
                }
                break;
            case 'dateOfBirth':
                if (!value) {
                    this.errors.dateOfBirth = 'Date of birth is required';
                } else {
                    const dob = new Date(value);
                    const today = new Date();
                    if (dob >= today) {
                        this.errors.dateOfBirth = 'Date of birth must be in the past';
                    }
                }
                break;
        }

        this.updateFormErrors();
    }

    updateFormErrors() {
        this.formErrors = Object.values(this.errors);
    }

    handleSubmit() {
        this.validateAllFields();
        
        if (this.formErrors.length === 0) {
            // Submit form logic here
            console.log('Form submitted:', this.formData);
        }
    }

    validateAllFields() {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'ssn', 'dateOfBirth', 'nationality'];
        requiredFields.forEach(field => {
            this.validateField({ target: { dataset: { field }, id: field } });
        });
    }

    handleClear() {
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            gender: '',
            dateOfBirth: '',
            maritalStatus: '',
            nationality: '',
            ssn: '',
            driversLicense: '',
            email: '',
            phone: '',
            preferredContact: '',
            newsletter: false,
            altPhone: '',
            socialMedia: '',
            skype: '',
            fax: ''
        };
        this.errors = {};
        this.formErrors = [];
    }
}