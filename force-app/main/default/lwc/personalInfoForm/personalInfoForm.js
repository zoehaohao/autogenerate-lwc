// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track dateOfBirth = '';
    @track gender = '';
    @track address = '';
    @track city = '';
    @track state = '';
    @track zipCode = '';
    @track ssn = '';
    @track errorMessage = '';

    genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' },
        { label: 'Prefer not to say', value: 'Prefer not to say' }
    ];

    handleLastNameChange(event) {
        this.lastName = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
    }

    handleDateOfBirthChange(event) {
        this.dateOfBirth = event.target.value;
    }

    handleGenderChange(event) {
        this.gender = event.target.value;
    }

    handleAddressChange(event) {
        this.address = event.target.value;
    }

    handleCityChange(event) {
        this.city = event.target.value;
    }

    handleStateChange(event) {
        this.state = event.target.value;
    }

    handleZipCodeChange(event) {
        this.zipCode = event.target.value;
    }

    handleSsnChange(event) {
        this.ssn = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted successfully');
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please fill in all required fields correctly.';
        }
    }

    validateForm() {
        const allValid = [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-combobox')
        ].reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);

        if (allValid) {
            return this.validateEmail() && this.validatePhone() && this.validateSSN() && this.validateZipCode();
        }
        return false;
    }

    validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }

    validatePhone() {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(this.phone.replace(/\D/g, ''));
    }

    validateSSN() {
        const ssnRegex = /^\d{9}$/;
        return ssnRegex.test(this.ssn.replace(/\D/g, ''));
    }

    validateZipCode() {
        const zipCodeRegex = /^\d{5}(-\d{4})?$/;
        return zipCodeRegex.test(this.zipCode);
    }
}