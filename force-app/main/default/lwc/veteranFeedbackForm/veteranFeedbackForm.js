// veteranFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class VeteranFeedbackForm extends LightningElement {
    @track currentDate = new Date().toLocaleDateString('en-AU');
    @track providerName = 'Sample Provider';
    @track outletName = 'Sample Outlet';
    @track outletId = 'OUT123';
    @track isVeteran = false;
    @track isVeteranStatusRequired = false;
    @track isFormValid = false;

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

    handleSubmit() {
        if (this.validateForm()) {
            // Submit form logic
            console.log('Form submitted');
        }
    }

    handleClear() {
        // Clear form logic
        this.template.querySelectorAll('lightning-input, lightning-checkbox-group, lightning-radio-group, lightning-textarea').forEach(element => {
            element.value = null;
        });
        this.isVeteran = false;
        this.isVeteranStatusRequired = false;
        this.validateForm();
    }

    handleSaveDraft() {
        // Save draft logic
        console.log('Draft saved');
    }

    autoSaveDraft() {
        // Auto-save draft logic
        console.log('Auto-saved draft');
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-checkbox-group, lightning-radio-group, lightning-textarea').forEach(element => {
            if (element.required && !element.value) {
                isValid = false;
            }
        });

        if (this.isVeteran) {
            this.template.querySelectorAll('[data-id="veteran-question"]').forEach(element => {
                if (!element.value) {
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
    }

    handleVeteranStatusChange(event) {
        this.isVeteran = event.detail.value === 'veteran';
        this.validateForm();
    }
}