// veteranFormManager.js
import { LightningElement, track } from 'lwc';

export default class VeteranFormManager extends LightningElement {
    @track providerName = 'Sample Provider';
    @track outletName = 'Sample Outlet';
    @track isVeteran = false;
    @track isVeteranStatusRequired = false;
    @track isFormValid = false;
    @track formData = {};

    typeOfAgedCareOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Respite Care', value: 'respite' }
    ];

    respondentTypeOptions = [
        { label: 'Aged care recipient', value: 'recipient' },
        { label: 'Family member', value: 'family' },
        { label: 'Friend/personal representative', value: 'friend' },
        { label: 'Aged care advocate', value: 'advocate' },
        { label: 'Community organization member', value: 'community' }
    ];

    veteranStatusOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'War widow/widower', value: 'widow' },
        { label: 'Dependent', value: 'dependent' }
    ];

    ratingOptions = [
        { label: 'Very Poor', value: '1' },
        { label: 'Poor', value: '2' },
        { label: 'Fair', value: '3' },
        { label: 'Good', value: '4' },
        { label: 'Excellent', value: '5' }
    ];

    connectedCallback() {
        this.validateForm();
        setInterval(() => this.autoSaveDraft(), 300000);
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateForm();
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }

    handleClear() {
        this.template.querySelectorAll('lightning-input, lightning-checkbox-group, lightning-radio-group, lightning-textarea').forEach(element => {
            element.value = null;
        });
        this.formData = {};
        this.isVeteran = false;
        this.isVeteranStatusRequired = false;
        this.validateForm();
    }

    handleSaveDraft() {
        console.log('Draft saved:', this.formData);
    }

    autoSaveDraft() {
        console.log('Auto-saved draft:', this.formData);
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-checkbox-group, lightning-radio-group, lightning-textarea').forEach(element => {
            if (element.required && !element.value) {
                isValid = false;
            }
        });

        if (this.isVeteran) {
            ['comfortWithStaff', 'staffMeetingNeeds', 'specializedCareDescription', 'providerCareRating', 'providerCareDetails'].forEach(field => {
                if (!this.formData[field]) {
                    isValid = false;
                }
            });
        }

        this.isFormValid = isValid;
        return isValid;
    }

    handleRespondentTypeChange(event) {
        const selectedValue = event.detail.value;
        this.isVeteranStatusRequired = ['recipient', 'family'].includes(selectedValue);
        this.handleInputChange(event);
    }

    handleVeteranStatusChange(event) {
        this.isVeteran = event.detail.value === 'veteran';
        this.handleInputChange(event);
    }
}