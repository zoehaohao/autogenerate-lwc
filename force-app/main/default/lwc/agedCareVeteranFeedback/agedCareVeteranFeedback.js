// agedCareVeteranFeedback.js
import { LightningElement, api, track } from 'lwc';

export default class AgedCareVeteranFeedback extends LightningElement {
    @api recordId;
    @api providerName;
    @api outletName;
    @api outletId;

    @track formData = {
        date: null,
        providerName: '',
        outletName: '',
        outletId: '',
        careType: [],
        respondentName: '',
        respondentPhone: '',
        respondentType: '',
        veteranStatus: '',
        staffComfort: '',
        staffMeetsNeeds: '',
        specializedCareNeeds: '',
        providerRating: '',
        providerDetails: '',
        additionalComments: ''
    };

    careTypeOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Respite Care', value: 'respite' }
    ];

    respondentTypeOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'Family Member', value: 'family' },
        { label: 'Carer', value: 'carer' }
    ];

    veteranStatusOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'War Widow/Widower', value: 'widow' }
    ];

    comfortOptions = [
        { label: 'Very Comfortable', value: 'very_comfortable' },
        { label: 'Comfortable', value: 'comfortable' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Uncomfortable', value: 'uncomfortable' },
        { label: 'Very Uncomfortable', value: 'very_uncomfortable' }
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
        return this.formData.respondentType === 'veteran';
    }

    connectedCallback() {
        this.initializeForm();
        this.loadPrePopulatedData();
    }

    initializeForm() {
        this.formData.date = new Date().toISOString().split('T')[0];
    }

    loadPrePopulatedData() {
        this.formData.providerName = this.providerName;
        this.formData.outletName = this.outletName;
        this.formData.outletId = this.outletId;
    }

    handleFieldChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name);
    }

    validateField(fieldName) {
        const field = this.template.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        let isValid = true;
        let errorMessage = '';

        if (field.required && !field.value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (fieldName === 'respondentPhone' && field.value) {
            const phoneRegex = /^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$/;
            if (!phoneRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid Australian phone number';
            }
        } else if (fieldName === 'feedbackDate') {
            const selectedDate = new Date(field.value);
            const today = new Date();
            if (selectedDate > today) {
                isValid = false;
                errorMessage = 'Please select today\'s date or earlier';
            }
        }

        if (!isValid) {
            field.setCustomValidity(errorMessage);
        } else {
            field.setCustomValidity('');
        }
        field.reportValidity();
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-radio-group, lightning-checkbox-group').forEach(field => {
            this.validateField(field.name);
            if (!field.checkValidity()) {
                isValid = false;
            }
        });
        return isValid;
    }

    handleSubmit() {
        if (this.validateForm()) {
            const submitEvent = new CustomEvent('formsubmit', {
                detail: this.formData
            });
            this.dispatchEvent(submitEvent);
        }
    }

    handleSaveDraft() {
        const saveDraftEvent = new CustomEvent('savedraft', {
            detail: this.formData
        });
        this.dispatchEvent(saveDraftEvent);
    }
}