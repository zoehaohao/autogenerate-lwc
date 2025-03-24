// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track currentSection = 1;
    @track errorMessage = '';
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
        imHandle: '',
        fax: ''
    };

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

    contactMethodOptions = [
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
        { label: 'SMS', value: 'sms' }
    ];

    get isPersonalInfoSection() {
        return this.currentSection === 1;
    }

    get isContactInfoSection() {
        return this.currentSection === 2;
    }

    get isLastSection() {
        return this.currentSection === 2;
    }

    get isSubmitDisabled() {
        return !this.validateCurrentSection();
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.formData[field] = value;
        this.validateField(event.target);
    }

    validateField(field) {
        if (field.required && !field.value) {
            field.setCustomValidity('This field is required');
        } else {
            field.setCustomValidity('');
        }
        field.reportValidity();
    }

    validateCurrentSection() {
        const fields = [...this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-radio-group')];
        return fields.reduce((valid, field) => {
            this.validateField(field);
            return valid && field.checkValidity();
        }, true);
    }

    handlePrevious() {
        if (this.currentSection > 1) {
            this.currentSection--;
            this.errorMessage = '';
        }
    }

    handleNext() {
        if (this.validateCurrentSection()) {
            if (this.currentSection < 2) {
                this.currentSection++;
                this.errorMessage = '';
            }
        } else {
            this.errorMessage = 'Please fill in all required fields correctly';
        }
    }

    handleSaveProgress() {
        if (this.validateCurrentSection()) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Progress saved successfully',
                    variant: 'success'
                })
            );
        } else {
            this.errorMessage = 'Please correct the errors before saving';
        }
    }

    handleSubmit() {
        if (this.validateCurrentSection()) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Form submitted successfully',
                    variant: 'success'
                })
            );
        } else {
            this.errorMessage = 'Please correct all errors before submitting';
        }
    }
}