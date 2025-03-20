// detailsForm.js
import { LightningElement, track } from 'lwc';

export default class DetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    @track isFormValid = false;

    titleOptions = [
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
        this.validateForm();
    }

    validateForm() {
        const allInputs = this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-radio-group');
        let isValid = true;

        allInputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        if (isValid) {
            isValid = this.validateAge() && this.validateDateRange();
        }

        this.isFormValid = isValid;
        return isValid;
    }

    validateAge() {
        if (this.formData.birthdate) {
            const birthDate = new Date(this.formData.birthdate);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                this.errorMessage = 'You must be at least 18 years old.';
                return false;
            }
        }
        return true;
    }

    validateDateRange() {
        if (this.formData.startDate && this.formData.endDate) {
            const startDate = new Date(this.formData.startDate);
            const endDate = new Date(this.formData.endDate);
            if (startDate >= endDate) {
                this.errorMessage = 'End Date must be after Start Date.';
                return false;
            }
        }
        return true;
    }

    handleSubmit() {
        if (this.validateForm()) {
            this.errorMessage = '';
            console.log('Form submitted:', this.formData);
        }
    }

    handleReset() {
        this.formData = {};
        this.errorMessage = '';
        this.isFormValid = false;
        const allInputs = this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-radio-group');
        allInputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'checkbox-button') {
                input.checked = false;
            } else if (input.type !== 'button') {
                input.value = null;
            }
        });
    }
}