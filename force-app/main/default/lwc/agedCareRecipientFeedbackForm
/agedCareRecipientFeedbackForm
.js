// agedCareRecipientFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class AgedCareRecipientFeedbackForm extends LightningElement {
    @track date = '';
    @track providerName = '';
    @track outletName = '';
    @track outletId = '';
    @track careType = '';
    @track homeBasedDetails = '';
    @track respondentName = '';
    @track respondentPhone = '';
    @track specializedCare = '';
    @track evaluation = '';
    @track feedback = '';
    @track comments = '';
    @track errorSummary = '';
    @track isSubmitDisabled = true;

    careTypes = [
        { label: 'Residential', value: 'residential' },
        { label: 'Home-based', value: 'homebased' }
    ];

    evaluationOptions = [
        { label: 'Excellent', value: 'excellent' },
        { label: 'Good', value: 'good' },
        { label: 'Fair', value: 'fair' },
        { label: 'Poor', value: 'poor' }
    ];

    get isHomeBased() {
        return this.careType === 'homebased';
    }

    validateForm() {
        let isValid = true;
        let errors = [];

        if (!this.providerName) {
            isValid = false;
            errors.push('Provider name is required');
        }

        if (!this.outletName) {
            isValid = false;
            errors.push('Outlet name is required');
        }

        if (!this.outletId) {
            isValid = false;
            errors.push('Outlet ID is required');
        }

        if (!this.careType) {
            isValid = false;
            errors.push('Type of aged care is required');
        }

        if (this.respondentPhone && !this.validatePhone(this.respondentPhone)) {
            isValid = false;
            errors.push('Invalid phone number format');
        }

        if (!this.specializedCare) {
            isValid = false;
            errors.push('Specialized care description is required');
        }

        if (!this.evaluation) {
            isValid = false;
            errors.push('Provider evaluation is required');
        }

        if (!this.feedback) {
            isValid = false;
            errors.push('Provider feedback is required');
        }

        this.errorSummary = errors.length ? errors.join('. ') : '';
        this.isSubmitDisabled = !isValid;
        return isValid;
    }

    validatePhone(phone) {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return phoneRegex.test(phone);
    }

    handleDateChange(event) {
        this.date = event.target.value;
        this.validateForm();
    }

    handleProviderNameChange(event) {
        this.providerName = event.target.value;
        this.validateForm();
    }

    handleOutletNameChange(event) {
        this.outletName = event.target.value;
        this.validateForm();
    }

    handleOutletIdChange(event) {
        this.outletId = event.target.value;
        this.validateForm();
    }

    handleCareTypeChange(event) {
        this.careType = event.target.value;
        this.validateForm();
    }

    handleHomeBasedDetailsChange(event) {
        this.homeBasedDetails = event.target.value;
    }

    handleRespondentNameChange(event) {
        this.respondentName = event.target.value;
    }

    handleRespondentPhoneChange(event) {
        this.respondentPhone = event.target.value;
        this.validateForm();
    }

    handleSpecializedCareChange(event) {
        this.specializedCare = event.target.value;
        this.validateForm();
    }

    handleEvaluationChange(event) {
        this.evaluation = event.target.value;
        this.validateForm();
    }

    handleFeedbackChange(event) {
        this.feedback = event.target.value;
        this.validateForm();
    }

    handleCommentsChange(event) {
        this.comments = event.target.value;
    }

    handleClear() {
        this.template.querySelectorAll('input, textarea').forEach(element => {
            element.value = '';
        });
        this.errorSummary = '';
        this.date = '';
        this.providerName = '';
        this.outletName = '';
        this.outletId = '';
        this.careType = '';
        this.homeBasedDetails = '';
        this.respondentName = '';
        this.respondentPhone = '';
        this.specializedCare = '';
        this.evaluation = '';
        this.feedback = '';
        this.comments = '';
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Form submission logic would go here
        }
    }
}