// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        country: 'United States',
        zipCode: ''
    };

    stateOptions = [
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        // Add more states as needed
    ];

    countryOptions = [
        { label: 'United States', value: 'United States' },
        { label: 'Canada', value: 'Canada' },
        // Add more countries as needed
    ];

    get isSubmitDisabled() {
        return !(this.formData.firstName && this.formData.lastName && this.formData.email && 
                 this.formData.dateOfBirth && this.formData.country);
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData = { ...this.formData, [name]: value };
        this.validateField(name, value);
    }

    validateField(fieldName, value) {
        let isValid = true;
        const inputField = this.template.querySelector(`[name="${fieldName}"]`);

        switch(fieldName) {
            case 'firstName':
            case 'lastName':
                isValid = /^[A-Za-z]+$/.test(value);
                break;
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                break;
            case 'phone':
                isValid = /^\d{3}-\d{3}-\d{4}$/.test(value);
                break;
            case 'dateOfBirth':
                isValid = this.validateAge(value);
                break;
            case 'city':
                isValid = /^[A-Za-z\s]+$/.test(value);
                break;
            case 'zipCode':
                isValid = /^[A-Za-z0-9]+$/.test(value);
                break;
        }

        if (inputField) {
            inputField.setCustomValidity(isValid ? '' : 'Invalid input');
            inputField.reportValidity();
        }
    }

    validateAge(birthDate) {
        const today = new Date();
        const dob = new Date(birthDate);
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age >= 18;
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Here you would typically call an Apex method to save the data
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Personal details submitted successfully', 'success');
            this.resetForm();
        } else {
            this.showToast('Error', 'Please correct the errors in the form', 'error');
        }
    }

    validateForm() {
        const allValid = [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-combobox'),
            ...this.template.querySelectorAll('lightning-textarea')
        ].reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);

        return allValid;
    }

    handleCancel() {
        this.resetForm();
        this.showToast('Info', 'Form has been reset', 'info');
    }

    resetForm() {
        this.formData = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            address: '',
            city: '',
            state: '',
            country: 'United States',
            zipCode: ''
        };
        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea').forEach(field => {
            field.value = '';
        });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}