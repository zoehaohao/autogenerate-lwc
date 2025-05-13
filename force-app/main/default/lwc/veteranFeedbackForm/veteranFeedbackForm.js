// veteranFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class VeteranFeedbackForm extends LightningElement {
    @track currentDate = new Date().toISOString().slice(0, 10);
    @track showVeteranStatus = false;
    @track showSpecializedCareDescription = false;

    typeOfAgedCareOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Respite Care', value: 'respite' }
    ];

    respondentTypeOptions = [
        { label: 'Aged care recipient', value: 'recipient' },
        { label: 'Family member', value: 'family' },
        { label: 'Friend/Representative', value: 'representative' },
        { label: 'Aged care advocate', value: 'advocate' }
    ];

    veteranStatusOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'War widow/widower', value: 'widow' }
    ];

    comfortOptions = [
        { label: 'Very comfortable', value: 'very_comfortable' },
        { label: 'Comfortable', value: 'comfortable' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Uncomfortable', value: 'uncomfortable' },
        { label: 'Very uncomfortable', value: 'very_uncomfortable' }
    ];

    meetingNeedsOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Partially', value: 'partially' }
    ];

    careAssessmentOptions = [
        { label: 'Excellent', value: 'excellent' },
        { label: 'Good', value: 'good' },
        { label: 'Fair', value: 'fair' },
        { label: 'Poor', value: 'poor' }
    ];

    handleRespondentTypeChange(event) {
        const selectedType = event.detail.value;
        this.showVeteranStatus = ['recipient', 'family'].includes(selectedType);
    }

    handleStaffMeetingNeedsChange(event) {
        this.showSpecializedCareDescription = event.detail.value === 'yes';
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        if (this.validateForm(fields)) {
            this.template.querySelector('lightning-record-edit-form').submit(fields);
        }
    }

    validateForm(fields) {
        let isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-radio-group, lightning-checkbox-group').forEach(element => {
            if (!element.reportValidity()) {
                isValid = false;
            }
        });
        return isValid;
    }

    handleClear() {
        this.template.querySelector('lightning-record-edit-form').reset();
        this.showVeteranStatus = false;
        this.showSpecializedCareDescription = false;
    }
}