// veteranAgedCareFeedback.js
import { LightningElement, track } from 'lwc';

export default class VeteranAgedCareFeedback extends LightningElement {
    @track showVeteranStatus = false;
    @track showStaffMeetingNeeds = false;
    @track veteranStatusLabel = '';

    careTypeOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Respite Care', value: 'respite' }
    ];

    respondentTypeOptions = [
        { label: 'Aged care recipient', value: 'recipient' },
        { label: 'Family member', value: 'family' },
        { label: 'Friend/personal representative', value: 'friend' },
        { label: 'Aged care advocate/navigator', value: 'advocate' }
    ];

    veteranStatusOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'War widow/widower', value: 'widow' },
        { label: 'Dependent', value: 'dependent' }
    ];

    comfortOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Sometimes', value: 'sometimes' }
    ];

    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    handleRespondentTypeChange(event) {
        const respondentType = event.detail.value;
        this.showVeteranStatus = true;
        this.veteranStatusLabel = respondentType === 'recipient' ? 'Veteran status (recipient)' : 'Veteran status (on behalf)';
    }

    handleComfortChange(event) {
        this.showStaffMeetingNeeds = event.detail.value === 'yes';
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Implement form submission logic here
            console.log('Form submitted');
        } else {
            // Show error message
            console.log('Form has errors');
        }
    }

    handleClear() {
        this.template.querySelectorAll('lightning-input, lightning-radio-group, lightning-textarea').forEach(element => {
            element.value = null;
        });
        this.showVeteranStatus = false;
        this.showStaffMeetingNeeds = false;
    }

    handleSaveDraft() {
        // Implement draft saving logic here
        console.log('Draft saved');
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-radio-group, lightning-textarea').forEach(element => {
            if (element.required && !element.value) {
                element.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }
}