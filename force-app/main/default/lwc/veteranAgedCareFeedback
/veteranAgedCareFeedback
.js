// veteranAgedCareFeedback.js
import { LightningElement, track } from 'lwc';

export default class VeteranAgedCareFeedback extends LightningElement {
    @track formData = {
        date: '',
        providerName: '',
        outletName: '',
        outletId: '',
        careType: [],
        respondentName: '',
        phoneNumber: '',
        respondentType: '',
        veteranStatus: '',
        comfortLevel: ''
    };

    @track errorMessage = '';

    careTypeOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Respite Care', value: 'respite' }
    ];

    respondentTypeOptions = [
        { label: 'Care Recipient', value: 'recipient' },
        { label: 'Family Member', value: 'family' },
        { label: 'Advocate', value: 'advocate' }
    ];

    veteranStatusOptions = [
        { label: '9a', value: '9a' },
        { label: '9b', value: '9b' }
    ];

    comfortLevelOptions = [
        { label: 'Very Comfortable', value: 'very' },
        { label: 'Somewhat Comfortable', value: 'somewhat' },
        { label: 'Not Comfortable', value: 'not' }
    ];

    get showVeteranStatus() {
        return this.formData.respondentType === 'recipient';
    }

    get showComfortLevel() {
        return this.formData.veteranStatus;
    }

    get isSubmitDisabled() {
        return !this.formData.date || 
               !this.formData.providerName || 
               !this.formData.outletName || 
               !this.formData.outletId || 
               this.formData.careType.length === 0 ||
               !this.formData.respondentType;
    }

    handleDateChange(event) {
        this.formData.date = event.target.value;
        this.clearError();
    }

    handleInputChange(event) {
        this.formData[event.target.name] = event.target.value;
        this.clearError();
    }

    handleCheckboxChange(event) {
        this.formData.careType = event.detail.value;
        this.clearError();
    }

    handleRadioChange(event) {
        this.formData[event.target.name] = event.target.value;
        this.clearError();
    }

    handlePhoneChange(event) {
        const phone = event.target.value.replace(/\D/g, '');
        this.formData.phoneNumber = phone;
        this.clearError();
    }

    clearError() {
        this.errorMessage = '';
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }

    handleClear() {
        this.formData = {
            date: '',
            providerName: '',
            outletName: '',
            outletId: '',
            careType: [],
            respondentName: '',
            phoneNumber: '',
            respondentType: '',
            veteranStatus: '',
            comfortLevel: ''
        };
        this.clearError();
    }

    validateForm() {
        if (this.isSubmitDisabled) {
            this.errorMessage = 'Please fill in all required fields';
            return false;
        }
        if (this.formData.phoneNumber && !/^\d{10}$/.test(this.formData.phoneNumber)) {
            this.errorMessage = 'Please enter a valid 10-digit phone number';
            return false;
        }
        return true;
    }
}