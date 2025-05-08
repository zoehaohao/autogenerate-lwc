// veteranFeedbackForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class VeteranFeedbackForm extends LightningElement {
    @track providerName = 'Default Provider';
    @track outletName = 'Default Outlet';
    @track outletId = 'DEF123';
    @track showVeteranQuestions = false;

    typeOfAgedCareOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Respite Care', value: 'respite' }
    ];

    roleOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'War widow/er', value: 'warWidow' },
        { label: 'Family member', value: 'family' },
        { label: 'Friend', value: 'friend' },
        { label: 'Carer', value: 'carer' }
    ];

    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    dvaCardOptions = [
        { label: 'Gold', value: 'gold' },
        { label: 'White', value: 'white' },
        { label: 'Orange', value: 'orange' }
    ];

    comfortLevelOptions = [
        { label: 'Very comfortable', value: 'veryComfortable' },
        { label: 'Comfortable', value: 'comfortable' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Uncomfortable', value: 'uncomfortable' },
        { label: 'Very uncomfortable', value: 'veryUncomfortable' }
    ];

    handleVeteranStatusChange(event) {
        this.showVeteranQuestions = event.detail.value === 'yes';
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            this.submitForm();
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-radio-group, lightning-checkbox-group, lightning-textarea')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (!allValid) {
            this.showToast('Error', 'Please fill in all required fields.', 'error');
        }

        return allValid;
    }

    submitForm() {
        this.showToast('Success', 'Form submitted successfully!', 'success');
    }

    handleClearForm() {
        this.template.querySelector('form').reset();
        this.showVeteranQuestions = false;
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