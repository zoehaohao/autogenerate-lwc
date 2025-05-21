// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track date = '';
    @track providerName = '';
    @track outletName = '';
    @track outletId = '';
    @track careType = '';
    @track homeBasedServices = '';
    @track respondentName = '';
    @track respondentPhone = '';
    @track role = [];
    @track isVeteran = '';
    @track isRecipientVeteran = '';
    @track isComfortable = '';
    @track doesMeetNeeds = '';
    @track veteranServices = '';
    @track doesProvideCare = '';
    @track providerFeedback = '';
    @track otherComments = '';

    handleCareTypeChange(event) {
        this.careType = event.target.value;
    }

    handleRoleChange(event) {
        const selectedValues = Array.from(event.target.selectedOptions, option => option.value);
        this.role = selectedValues;
    }

    handleVeteranChange(event) {
        this.isVeteran = event.target.value;
    }

    handleRecipientVeteranChange(event) {
        this.isRecipientVeteran = event.target.value;
    }

    handleComfortableChange(event) {
        this.isComfortable = event.target.value;
    }

    handleMeetNeedsChange(event) {
        this.doesMeetNeeds = event.target.value;
    }

    handleVeteranServicesChange(event) {
        this.veteranServices = event.target.value;
    }

    handleProvidesCareChange(event) {
        this.doesProvideCare = event.target.value;
    }

    handleProviderFeedbackChange(event) {
        this.providerFeedback = event.target.value;
    }

    handleOtherCommentsChange(event) {
        this.otherComments = event.target.value;
    }

    handleSubmit(event) {
        event.preventDefault();
        // Implement form submission logic here
        // e.g., validate form data, make API calls, etc.
        console.log('Form submitted:', this.formData);
    }

    get formData() {
        return {
            date: this.date,
            providerName: this.providerName,
            outletName: this.outletName,
            outletId: this.outletId,
            careType: this.careType,
            homeBasedServices: this.homeBasedServices,
            respondentName: this.respondentName,
            respondentPhone: this.respondentPhone,
            role: this.role,
            isVeteran: this.isVeteran,
            isRecipientVeteran: this.isRecipientVeteran,
            isComfortable: this.isComfortable,
            doesMeetNeeds: this.doesMeetNeeds,
            veteranServices: this.veteranServices,
            doesProvideCare: this.doesProvideCare,
            providerFeedback: this.providerFeedback,
            otherComments: this.otherComments
        };
    }
}
