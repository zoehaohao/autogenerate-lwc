// agedCareRecipientFeedbackForm.js
import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AgedCareRecipientFeedbackForm extends LightningElement {
    @api providerName;
    @api outletName;
    @api outletId;
    @track formData = {};

    typeOfAgedCareOptions = [
        { label: 'Residential aged care', value: 'residential' },
        { label: 'Home-based aged care', value: 'home-based' }
    ];

    respondentTypeOptions = [
        { label: 'Aged care recipient', value: 'recipient' },
        { label: 'Family member', value: 'family' },
        { label: 'Friend/representative', value: 'friend' },
        { label: 'Aged care advocate', value: 'advocate' }
    ];

    veteranStatusOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'War widow/widower', value: 'widow' },
        { label: 'Not applicable', value: 'na' }
    ];

    comfortLevelOptions = [
        { label: 'Very comfortable', value: 'very_comfortable' },
        { label: 'Comfortable', value: 'comfortable' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Uncomfortable', value: 'uncomfortable' },
        { label: 'Very uncomfortable', value: 'very_uncomfortable' }
    ];

    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    ratingOptions = [
        { label: 'Excellent', value: 'excellent' },
        { label: 'Good', value: 'good' },
        { label: 'Average', value: 'average' },
        { label: 'Poor', value: 'poor' },
        { label: 'Very Poor', value: 'very_poor' }
    ];

    get showVeteranStatus() {
        return this.formData.respondentType === 'recipient' || this.formData.respondentType === 'family';
    }

    get veteranStatusLabel() {
        return this.formData.respondentType === 'recipient' ? 'Are you a veteran or war widow/widower?' : 'Is the person you are representing a veteran or war widow/widower?';
    }

    get showComfortLevel() {
        return this.formData.respondentType === 'recipient';
    }

    get showStaffMeetingNeeds() {
        return this.formData.respondentType === 'recipient' || this.formData.respondentType === 'family';
    }

    get showSpecializedCare() {
        return this.formData.veteranStatus === 'veteran' || this.formData.veteranStatus === 'widow';
    }

    handleInputChange(event) {
        const { name, value, checked } = event.target;
        if (event.target.type === 'checkbox-group') {
            this.formData[name] = event.detail.value;
        } else {
            this.formData[name] = event.target.type === 'checkbox' ? checked : value;
        }
        this.autoSave();
    }

    autoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            console.log('Auto-saving:', this.formData);
            // Implement your auto-save logic here
        }, 2000);
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Feedback submitted successfully', 'success');
            this.resetForm();
        } else {
            this.showToast('Error', 'Please fill in all required fields', 'error');
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('.required-field')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        return allValid;
    }

    resetForm() {
        this.formData = {};
        this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-combobox, lightning-radio-group, lightning-checkbox-group').forEach(element => {
            if (element.name !== 'providerName' && element.name !== 'outletName' && element.name !== 'outletId') {
                element.value = undefined;
                if (element.type === 'checkbox-group') {
                    element.value = [];
                }
            }
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