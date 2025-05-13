// veteranFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class VeteranFeedbackForm extends LightningElement {
    @track currentDate = new Date().toISOString().split('T')[0];
    @track providerName = 'Outlet representative to enter provider name';
    @track outletName = 'Outlet representative to enter outlet name';
    @track outletId = 'Outlet representative to enter outlet ID';
    @track showHomeCareServices = false;
    @track showVeteranStatusError = false;
    @track isVeteran = false;
    @track showStaffMeetNeeds = false;
    @track veteranStatusLabel = 'Are you a veteran?';

    typeOfAgedCareOptions = [
        { label: 'Residential aged care', value: 'residential' },
        { label: 'Home-based aged care', value: 'home-based' }
    ];

    respondentTypeOptions = [
        { label: 'An aged care recipient', value: 'recipient' },
        { label: 'A family member of an aged care recipient', value: 'family' },
        { label: 'A friend or other personal representative of an aged care recipient', value: 'representative' },
        { label: 'An aged care advocate, navigator or member of a community organisation who is responding with or on behalf of an aged care recipient', value: 'advocate' }
    ];

    veteranStatusOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    comfortOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Unsure', value: 'unsure' }
    ];

    handleTypeOfAgedCareChange(event) {
        this.showHomeCareServices = event.detail.value.includes('home-based');
    }

    handleRespondentTypeChange(event) {
        const respondentType = event.detail.value;
        this.veteranStatusLabel = respondentType === 'recipient' 
            ? 'Are you a veteran?' 
            : 'Is the aged care recipient a veteran?';
    }

    handleVeteranStatusChange(event) {
        const isVeteran = event.detail.value === 'yes';
        this.showVeteranStatusError = !isVeteran;
        this.isVeteran = isVeteran;
    }

    handleComfortChange(event) {
        this.showStaffMeetNeeds = event.detail.value === 'yes';
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Implement form submission logic here
            console.log('Form submitted');
        } else {
            console.log('Form validation failed');
        }
    }

    handleClear() {
        this.template.querySelector('form').reset();
        this.showHomeCareServices = false;
        this.showVeteranStatusError = false;
        this.isVeteran = false;
        this.showStaffMeetNeeds = false;
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-radio-group, lightning-checkbox-group, lightning-textarea').forEach(element => {
            if (element.reportValidity && !element.reportValidity()) {
                isValid = false;
            }
        });
        return isValid;
    }

    openHelpGuide() {
        // Implement help guide modal logic
    }

    openPrivacyPolicy() {
        // Implement privacy policy page opening logic
    }
}