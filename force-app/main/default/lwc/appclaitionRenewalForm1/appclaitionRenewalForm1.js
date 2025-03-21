// appclaitionRenewalForm1.js
import { LightningElement, track } from 'lwc';

export default class AppclaitionRenewalForm1 extends LightningElement {
    @track errorMessage = '';
    titleOptions = [
        { label: 'Mr', value: 'Mr' },
        { label: 'Mrs', value: 'Mrs' },
        { label: 'Ms', value: 'Ms' },
        { label: 'Dr', value: 'Dr' }
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

    handleSubmit() {
        if (this.validateForm()) {
            // Form submission logic here
            console.log('Form submitted successfully');
        }
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-radio-group').forEach(element => {
            element.value = null;
        });
        this.errorMessage = '';
    }

    validateForm() {
        let isValid = true;
        let errorMessages = [];

        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-radio-group').forEach(element => {
            if (element.required && !element.value) {
                isValid = false;
                errorMessages.push(`${element.label} is required`);
            }
        });

        const birthdate = this.template.querySelector('lightning-input[label="Birthdate"]').value;
        if (birthdate && !this.isOver18(birthdate)) {
            isValid = false;
            errorMessages.push('You must be over 18 years old');
        }

        const startDate = this.template.querySelector('lightning-input[label="Start Date"]').value;
        const endDate = this.template.querySelector('lightning-input[label="End Date"]').value;
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            isValid = false;
            errorMessages.push('End Date must be after Start Date');
        }

        this.errorMessage = errorMessages.join('. ');
        return isValid;
    }

    isOver18(birthdate) {
        const today = new Date();
        const birthdateObj = new Date(birthdate);
        const age = today.getFullYear() - birthdateObj.getFullYear();
        const monthDiff = today.getMonth() - birthdateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateObj.getDate())) {
            age--;
        }
        return age >= 18;
    }
}