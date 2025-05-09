// agedCareVeteranFeedback.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AgedCareVeteranFeedback extends LightningElement {
    @track currentDate = new Date().toISOString().split('T')[0];
    @track providerName = '';
    @track outletName = '';
    @track outletId = '';
    @track errorMessages = [];
    @track formData = {};
    @track showVeteranSection = false;
    @track showCareExperience = false;
    @track showSpecializedCare = false;
    @track isVeteranRequired = false;
    @track isSubmitDisabled = true;

    careTypeOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Respite Care', value: 'respite' }
    ];

    respondentTypeOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'Family Member', value: 'family' },
        { label: 'Care Representative', value: 'representative' }
    ];

    veteranStatusOptions = [
        { label: 'Current Service', value: 'current' },
        { label: 'Past Service', value: 'past' }
    ];

    comfortLevelOptions = [
        { label: 'Very Comfortable', value: 'very_comfortable' },
        { label: 'Comfortable', value: 'comfortable' },
        { label: 'Uncomfortable', value: 'uncomfortable' }
    ];

    staffResponseOptions = [
        { label: 'Excellent', value: 'excellent' },
        { label: 'Good', value: 'good' },
        { label: 'Fair', value: 'fair' },
        { label: 'Poor', value: 'poor' }
    ];

    providerRatingOptions = [
        { label: '5 - Excellent', value: '5' },
        { label: '4 - Good', value: '4' },
        { label: '3 - Average', value: '3' },
        { label: '2 - Poor', value: '2' },
        { label: '1 - Very Poor', value: '1' }
    ];

    connectedCallback() {
        this.loadPrePopulatedData();
        this.setupAutosave();
    }

    loadPrePopulatedData() {
        this.providerName = 'Sample Provider';
        this.outletName = 'Sample Outlet';
        this.outletId = 'OUT123';
    }

    setupAutosave() {
        setInterval(() => {
            this.saveFormData();
        }, 300000);
    }

    validateForm() {
        this.errorMessages = [];
        let isValid = true;

        const inputs = this.template.querySelectorAll('lightning-input, lightning-radio-group, lightning-checkbox-group, lightning-textarea');
        inputs.forEach(input => {
            if (input.required && !input.value) {
                isValid = false;
                this.errorMessages.push(`${input.label} is required`);
            }
        });

        return isValid;
    }

    handleDateChange(event) {
        this.formData.date = event.target.value;
        this.validateForm();
    }

    handleCareTypeChange(event) {
        this.formData.careType = event.detail.value;
        this.validateForm();
    }

    handleRespondentTypeChange(event) {
        this.formData.respondentType = event.detail.value;
        this.showVeteranSection = event.detail.value === 'veteran';
        this.isVeteranRequired = this.showVeteranSection;
        this.validateForm();
    }

    handleVeteranStatusChange(event) {
        this.formData.veteranStatus = event.detail.value;
        this.showCareExperience = true;
        this.showSpecializedCare = true;
        this.validateForm();
    }

    handleSubmit() {
        if (this.validateForm()) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Form submitted successfully',
                    variant: 'success'
                })
            );
        }
    }

    handleSaveDraft() {
        this.saveFormData();
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Draft saved successfully',
                variant: 'success'
            })
        );
    }

    handleClear() {
        this.template.querySelectorAll('lightning-input, lightning-radio-group, lightning-checkbox-group, lightning-textarea').forEach(element => {
            if (element.type !== 'hidden') {
                element.value = null;
            }
        });
        this.formData = {};
        this.errorMessages = [];
    }

    saveFormData() {
        localStorage.setItem('veteranFeedbackDraft', JSON.stringify(this.formData));
    }
}