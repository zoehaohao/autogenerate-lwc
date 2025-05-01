// personalInfoForm.js
import { LightningElement, track } from 'lwc';
export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    stateOptions = [
        { value: 'AL', label: 'Alabama' },
        { value: 'AK', label: 'Alaska' },
        { value: 'AZ', label: 'Arizona' },
    ];
    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
    }
    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        }
    }
    handleClear() {
        this.template.querySelectorAll('input, select').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errorMessage = '';
    }
    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate', 'endDate'];
        let isValid = true;
        requiredFields.forEach(field => {
            if (!this.formData[field]) {
                isValid = false;
                this.errorMessage = 'Please fill in all required fields.';
            }
        });
        if (isValid) {
            if (!/^\d{5}$/.test(this.formData.zipCode)) {
                isValid = false;
                this.errorMessage = 'Zip code must be 5 digits.';
            }
            const startDate = new Date(this.formData.startDate);
            const endDate = new Date(this.formData.endDate);
            if (startDate >= endDate) {
                isValid = false;
                this.errorMessage = 'Start Date must be before End Date.';
            }
        }
        return isValid;
    }
}