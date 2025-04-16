// addressZipCodeRemover.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AddressZipCodeRemover extends LightningElement {
    @track formData = {
        street: '',
        apartment: '',
        city: '',
        state: '',
        country: ''
    };
    @track errors = {};
    @track stateOptions = [];
    countryOptions = [
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' }
    ];

    get isSubmitDisabled() {
        return !this.isFormValid() || Object.keys(this.errors).length > 0;
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }

    handleBlur(event) {
        const { name, value } = event.target;
        this.validateField(name, value);
    }

    handleCountryChange(event) {
        this.handleInputChange(event);
        this.updateStateOptions(event.target.value);
    }

    updateStateOptions(countryCode) {
        this.stateOptions = countryCode === 'US'
            ? [{ label: 'California', value: 'CA' }, { label: 'New York', value: 'NY' }]
            : [{ label: 'Ontario', value: 'ON' }, { label: 'Quebec', value: 'QC' }];
        this.formData.state = '';
    }

    validateField(name, value) {
        let errorMessage = '';
        switch (name) {
            case 'street':
                if (value.length < 5) errorMessage = 'Street address must be at least 5 characters';
                else if (!/^[a-zA-Z0-9\s#\-/]+$/.test(value)) errorMessage = 'Invalid characters in street address';
                break;
            case 'apartment':
                if (!/^[a-zA-Z0-9\s-]*$/.test(value)) errorMessage = 'Invalid characters in apartment/suite';
                break;
            case 'city':
                if (value.length < 2) errorMessage = 'City must be at least 2 characters';
                else if (!/^[a-zA-Z\s]+$/.test(value)) errorMessage = 'City should contain only letters and spaces';
                break;
            case 'state':
            case 'country':
                if (!value) errorMessage = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
                break;
        }
        if (errorMessage) {
            this.errors[name] = errorMessage;
        } else {
            delete this.errors[name];
        }
    }

    isFormValid() {
        return this.formData.street && this.formData.city && this.formData.state && this.formData.country;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.isFormValid()) {
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Address saved successfully', 'success');
        } else {
            this.showToast('Error', 'Please fill all required fields', 'error');
        }
    }

    handleClear() {
        this.formData = { street: '', apartment: '', city: '', state: '', country: '' };
        this.errors = {};
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}