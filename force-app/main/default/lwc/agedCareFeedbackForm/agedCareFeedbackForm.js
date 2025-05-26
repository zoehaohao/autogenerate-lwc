// agedCareFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class AgedCareFeedbackForm extends LightningElement {
    @track agedCareType;
    @track isComfortable;
    @track meetNeeds;
    @track isVeteran;
    @track isRecipientVeteran;
    @track specialisedCare;
    @track providesCare;
    @track respondentType = [];
    @track formData = {
        date: null,
        providerName: '',
        outletName: '',
        outletId: '',
        respondentName: '',
        respondentPhone: '',
        homeBasedServices: ''
    };
    @track errors = {};
    @track isSubmitting = false;

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }

    handleRadioChange(event) {
        const { name, value } = event.target;
        this[name] = value;
        this.validateField(name, value);
    }

    handleCheckboxChange(event) {
        const { value, checked } = event.target;
        if (checked) {
            this.respondentType.push(value);
        } else {
            this.respondentType = this.respondentType.filter(item => item !== value);
        }
        this.validateField('respondentType', this.respondentType);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.isSubmitting = true;

        this.validateForm()
            .then(() => this.submitForm())
            .catch(error => this.showError(error))
            .finally(() => {
                this.isSubmitting = false;
            });
    }

    handleCancel() {
        // Reset form or navigate away
    }

    validateForm() {
        this.errors = {};
        let isValid = true;

        // Validate required fields
        const requiredFields = ['date', 'providerName', 'outletName', 'outletId'];
        requiredFields.forEach(field => {
            if (!this.formData[field]) {
                this.errors[field] = `${field} is required`;
                isValid = false;
            }
        });

        // Validate respondent type
        if (!this.respondentType.length) {
            this.errors.respondentType = 'Please select at least one respondent type';
            isValid = false;
        }

        // Validate veteran status
        if (this.respondentType.includes('recipient') && !this.isVeteran) {
            this.errors.isVeteran = 'Please indicate if you are a veteran';
            isValid = false;
        }

        if (this.respondentType.includes('representative') && !this.isRecipientVeteran) {
            this.errors.isRecipientVeteran = 'Please indicate if the recipient is a veteran';
            isValid = false;
        }

        // Validate other fields based on requirements

        return isValid;
    }

    validateField(fieldName, value) {
        // Implement field-level validation logic
        // Clear error for the field if it passes validation
        this.errors[fieldName] = null;
    }

    submitForm() {
        // Implement form submission logic
        // e.g., send data to server, show success message, etc.
        console.log('Form data:', this.formData);
        console.log('Additional data:', {
            agedCareType: this.agedCareType,
            isComfortable: this.isComfortable,
            meetNeeds: this.meetNeeds,
            isVeteran: this.isVeteran,
            isRecipientVeteran: this.isRecipientVeteran,
            specialisedCare: this.specialisedCare,
            providesCare: this.providesCare,
            respondentType: this.respondentType
        });
    }

    showError(error) {
        // Show error message or toast
        console.error(error);
    }
}
