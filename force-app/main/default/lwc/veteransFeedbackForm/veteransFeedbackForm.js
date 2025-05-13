// veteransFeedbackForm.js
import { LightningElement, track } from 'lwc';

export default class VeteransFeedbackForm extends LightningElement {
    @track formData = {
        providerName: '',
        outletName: '',
        outletId: '',
        agedCareType: '',
        respondentName: '',
        respondentPhone: '',
        feedback: ''
    };
    @track errorMessage = '';
    @track successMessage = '';

    agedCareTypeOptions = [
        { label: 'Residential', value: 'residential' },
        { label: 'Home Care', value: 'homeCare' },
        { label: 'Flexible Care', value: 'flexibleCare' }
    ];

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.formData[field] = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            this.submitForm();
        }
    }

    validateForm() {
        this.errorMessage = '';
        let isValid = true;

        Object.entries(this.formData).forEach(([key, value]) => {
            if (!value.trim()) {
                this.errorMessage = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
                isValid = false;
            }
        });

        if (isValid && !this.isValidPhone(this.formData.respondentPhone)) {
            this.errorMessage = 'Please enter a valid phone number.';
            isValid = false;
        }

        return isValid;
    }

    isValidPhone(phone) {
        const phoneRegex = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
        return phoneRegex.test(phone);
    }

    submitForm() {
        // Here you would typically make an API call to submit the form data
        console.log('Form submitted:', this.formData);
        this.successMessage = 'Thank you for your feedback!';
        this.resetForm();
    }

    resetForm() {
        this.formData = {
            providerName: '',
            outletName: '',
            outletId: '',
            agedCareType: '',
            respondentName: '',
            respondentPhone: '',
            feedback: ''
        };
        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea').forEach(element => {
            element.value = '';
        });
    }
}