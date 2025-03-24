// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

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
        skypeIm: '',
        fax: ''
    };

    @track formErrors = '';

    get genderOptions() {
        return [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' }
        ];
    }

    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.formData[field] = value;
        this.validateField(field, value);
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'nationality', 'ssn', 'email', 'phone', 'preferredContact'];
        let isValid = true;
        let errors = [];

        requiredFields.forEach(field => {
            const value = this.formData[field];
            if (!value) {
                isValid = false;
                errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
            }
        });

        this.formErrors = errors.join('. ');
        return isValid;
    }

    handleSubmit() {
        if (this.validateForm()) {
            this.showToast('Success', 'Form submitted successfully', 'success');
        }
    }

    handleSaveDraft() {
        this.showToast('Success', 'Draft saved successfully', 'success');
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
            skypeIm: '',
            fax: ''
        };
        this.formErrors = '';
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