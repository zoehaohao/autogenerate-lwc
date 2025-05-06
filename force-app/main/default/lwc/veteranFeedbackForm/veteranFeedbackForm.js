// veteranFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class VeteranFeedbackForm extends LightningElement {
    @track typeOfAgedCareOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Respite Care', value: 'respite' }
    ];

    @track respondentStatusOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'Representative', value: 'representative' }
    ];

    @track veteranStatusOptions = [
        { label: 'Gold Card Holder', value: 'gold' },
        { label: 'White Card Holder', value: 'white' }
    ];

    @track comfortOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    @track meetingNeedsOptions = [
        { label: 'Very Well', value: 'veryWell' },
        { label: 'Well', value: 'well' },
        { label: 'Not Well', value: 'notWell' }
    ];

    @track careRatingOptions = [
        { label: 'Excellent', value: 'excellent' },
        { label: 'Good', value: 'good' },
        { label: 'Fair', value: 'fair' },
        { label: 'Poor', value: 'poor' }
    ];

    @track errorMessage = '';
    @track isVeteran = false;
    @track isStaffComfortYes = false;
    @track isVeteranStatusRequired = false;

    handleSubmit() {
        if (this.validateForm()) {
            // Form submission logic here
            console.log('Form submitted successfully');
        }
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input, lightning-checkbox-group, lightning-radio-group, lightning-textarea').forEach(element => {
            element.value = null;
        });
        this.errorMessage = '';
        this.isVeteran = false;
        this.isStaffComfortYes = false;
        this.isVeteranStatusRequired = false;
    }

    validateForm() {
        let isValid = true;
        let errorMessages = [];

        this.template.querySelectorAll('lightning-input, lightning-checkbox-group, lightning-radio-group, lightning-textarea').forEach(element => {
            if (element.required && !element.value) {
                isValid = false;
                errorMessages.push(`${element.label} is required`);
            }
        });

        const phoneInput = this.template.querySelector('lightning-input[type="tel"]');
        if (phoneInput.value && !this.isValidPhoneNumber(phoneInput.value)) {
            isValid = false;
            errorMessages.push('Invalid phone number format');
        }

        if (!isValid) {
            this.errorMessage = errorMessages.join('. ');
        } else {
            this.errorMessage = '';
        }

        return isValid;
    }

    isValidPhoneNumber(phone) {
        return /^\d{10}$/.test(phone);
    }

    handleRespondentStatusChange(event) {
        this.isVeteran = event.detail.value === 'veteran';
        this.isVeteranStatusRequired = this.isVeteran;
    }

    handleStaffComfortChange(event) {
        this.isStaffComfortYes = event.detail.value === 'yes';
    }
}