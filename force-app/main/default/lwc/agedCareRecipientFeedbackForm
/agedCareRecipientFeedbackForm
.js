// agedCareRecipientFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class AgedCareRecipientFeedbackForm extends LightningElement {
    @track providerName = 'Sample Provider';
    @track outletName = 'Sample Outlet';
    @track outletId = 'OUT123';
    @track errorMessage = '';
    @track selectedRespondentType = '';
    @track selectedVeteranStatus = '';
    @track selectedComfortLevel = '';
    @track isVeteran = false;
    @track showVeteranQuestions = false;
    @track showComfortQuestions = false;
    @track isSubmitDisabled = true;

    careTypes = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Respite Care', value: 'respite' }
    ];

    respondentTypes = [
        { label: 'Care Recipient', value: 'recipient' },
        { label: 'Family Member', value: 'family' },
        { label: 'Representative', value: 'representative' }
    ];

    veteranStatusOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'Non-veteran', value: 'non-veteran' }
    ];

    comfortLevelOptions = [
        { label: 'Very Comfortable', value: 'very-comfortable' },
        { label: 'Comfortable', value: 'comfortable' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Uncomfortable', value: 'uncomfortable' },
        { label: 'Very Uncomfortable', value: 'very-uncomfortable' }
    ];

    handleDateChange(event) {
        this.validateForm();
    }

    handleCareTypeChange(event) {
        this.validateForm();
    }

    handleRespondentNameChange(event) {
        this.validateForm();
    }

    handlePhoneChange(event) {
        const phoneRegex = /^[0-9]{10}$/;
        if (event.target.value && !phoneRegex.test(event.target.value)) {
            this.errorMessage = 'Please enter a valid Australian phone number';
        } else {
            this.errorMessage = '';
        }
        this.validateForm();
    }

    handleRespondentTypeChange(event) {
        this.selectedRespondentType = event.detail.value;
        this.showVeteranQuestions = true;
        this.validateForm();
    }

    handleVeteranStatusChange(event) {
        this.selectedVeteranStatus = event.detail.value;
        this.isVeteran = this.selectedVeteranStatus === 'veteran';
        this.showComfortQuestions = true;
        this.validateForm();
    }

    handleComfortLevelChange(event) {
        this.selectedComfortLevel = event.detail.value;
        this.validateForm();
    }

    handleFeedbackChange(event) {
        this.validateForm();
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-radio-group, lightning-textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (input.required && !input.value) {
                isValid = false;
            }
        });

        const careTypeCheckboxes = this.template.querySelectorAll('lightning-input[type="checkbox"]');
        let hasSelectedCareType = false;
        careTypeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                hasSelectedCareType = true;
            }
        });

        this.isSubmitDisabled = !isValid || !hasSelectedCareType || this.errorMessage;
    }

    handleClear() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-radio-group, lightning-textarea');
        inputs.forEach(input => {
            input.value = '';
        });
        this.selectedRespondentType = '';
        this.selectedVeteranStatus = '';
        this.selectedComfortLevel = '';
        this.showVeteranQuestions = false;
        this.showComfortQuestions = false;
        this.errorMessage = '';
        this.isSubmitDisabled = true;
    }

    handleSubmit() {
        if (!this.isSubmitDisabled) {
            // Handle form submission
        }
    }
}