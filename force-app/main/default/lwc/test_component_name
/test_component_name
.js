// veteransFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class VeteransFeedbackForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    @track isHomeBasedCare = false;
    @track showNeedsMet = false;
    @track isSubmitDisabled = true;

    today = new Date().toISOString().split('T')[0];

    careTypeOptions = [
        { label: 'Home-based Care', value: 'home' },
        { label: 'Facility-based Care', value: 'facility' }
    ];

    respondentTypeOptions = [
        { label: 'Veteran', value: 'veteran' },
        { label: 'Family Member', value: 'family' },
        { label: 'Friend/Representative', value: 'representative' },
        { label: 'Advocate', value: 'advocate' }
    ];

    veteranStatusOptions = [
        { label: 'Current Service', value: 'current' },
        { label: 'Ex-Service', value: 'ex' }
    ];

    comfortLevelOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    needsMetOptions = [
        { label: 'Fully Met', value: 'fully' },
        { label: 'Partially Met', value: 'partially' },
        { label: 'Not Met', value: 'not' }
    ];

    providerAssessmentOptions = [
        { label: 'Excellent', value: 'excellent' },
        { label: 'Good', value: 'good' },
        { label: 'Fair', value: 'fair' },
        { label: 'Poor', value: 'poor' }
    ];

    handleInputChange(event) {
        this.formData[event.target.label] = event.target.value;
        this.validateForm();
    }

    handleDateChange(event) {
        const selectedDate = new Date(event.target.value);
        const today = new Date();
        
        if (selectedDate > today) {
            this.errorMessage = 'Date cannot be in the future';
            return;
        }
        
        this.formData.date = event.target.value;
        this.validateForm();
    }

    handleCareTypeChange(event) {
        this.formData.careType = event.target.value;
        this.isHomeBasedCare = event.target.value === 'home';
        this.validateForm();
    }

    handleComfortLevelChange(event) {
        this.formData.comfortLevel = event.target.value;
        this.showNeedsMet = event.target.value === 'yes';
        this.validateForm();
    }

    handlePhoneChange(event) {
        const phoneRegex = /^\({0,1}((0|\+61)(2|4|3|7|8)){0,1}\){0,1}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{1}(\ |-){0,1}[0-9]{3}$/;
        if (event.target.value && !phoneRegex.test(event.target.value)) {
            this.errorMessage = 'Invalid phone number format';
            return;
        }
        this.formData.phone = event.target.value;
        this.validateForm();
    }

    validateForm() {
        this.errorMessage = '';
        this.isSubmitDisabled = !this.isFormValid();
    }

    isFormValid() {
        const requiredFields = ['date', 'Provider Name', 'Outlet Name', 'Outlet ID', 'careType'];
        return requiredFields.every(field => this.formData[field]);
    }

    handleSaveDraft() {
        // Implementation for saving draft
    }

    handleSubmit() {
        if (this.isFormValid()) {
            // Implementation for form submission
        }
    }

    handleClearForm() {
        this.formData = {};
        this.isHomeBasedCare = false;
        this.showNeedsMet = false;
        this.errorMessage = '';
        this.isSubmitDisabled = true;
    }

    handlePrint() {
        window.print();
    }

    handleEmail() {
        // Implementation for email functionality
    }
}