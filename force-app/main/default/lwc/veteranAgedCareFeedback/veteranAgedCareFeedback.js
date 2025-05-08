// veteranAgedCareFeedback.js
import { LightningElement, track } from 'lwc';

export default class VeteranAgedCareFeedback extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    @track showVeteranStatus = false;
    @track showProviderMeetingNeeds = false;

    typeOfAgedCareOptions = [
        { label: 'Home Care', value: 'homeCare' },
        { label: 'Residential Care', value: 'residentialCare' },
        { label: 'Respite Care', value: 'respiteCare' },
        { label: 'Transition Care', value: 'transitionCare' }
    ];

    respondentTypeOptions = [
        { label: 'Aged care recipient (veteran)', value: 'veteran' },
        { label: 'Family member', value: 'family' },
        { label: 'Friend/personal representative', value: 'friend' },
        { label: 'Aged care advocate/navigator', value: 'advocate' }
    ];

    veteranStatusOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'War widow/widower', value: 'warWidow' }
    ];

    comfortLevelOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Unsure', value: 'unsure' }
    ];

    providerMeetingNeedsOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Partially', value: 'partially' }
    ];

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;

        if (name === 'respondentType') {
            this.showVeteranStatus = value !== 'veteran';
        }

        if (name === 'comfortLevel') {
            this.showProviderMeetingNeeds = value === 'yes';
        }
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        }
    }

    handleClear() {
        this.formData = {};
        this.errorMessage = '';
        this.showVeteranStatus = false;
        this.showProviderMeetingNeeds = false;
        this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-checkbox-group, lightning-radio-group').forEach(element => {
            element.value = null;
            if (element.type === 'checkbox-group') {
                element.value = [];
            }
        });
    }

    validateForm() {
        let isValid = true;
        let errorMessages = [];

        if (this.formData.date && !this.isValidDate(this.formData.date)) {
            errorMessages.push('Please enter a valid date.');
            isValid = false;
        }

        if (this.formData.respondentPhone && !this.isValidPhoneNumber(this.formData.respondentPhone)) {
            errorMessages.push('Please enter a valid phone number.');
            isValid = false;
        }

        if (this.showVeteranStatus && !this.formData.veteranStatus) {
            errorMessages.push('Veteran status is required.');
            isValid = false;
        }

        if (this.showProviderMeetingNeeds && !this.formData.providerMeetingNeeds) {
            errorMessages.push('Provider meeting needs is required.');
            isValid = false;
        }

        if (!this.formData.typeOfAgedCare || this.formData.typeOfAgedCare.length === 0) {
            errorMessages.push('Please select at least one type of aged care.');
            isValid = false;
        }

        this.errorMessage = errorMessages.join(' ');
        return isValid;
    }

    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString) && !isNaN(Date.parse(dateString));
    }

    isValidPhoneNumber(phoneNumber) {
        const regex = /^[\d\s()+-]+$/;
        return regex.test(phoneNumber);
    }
}