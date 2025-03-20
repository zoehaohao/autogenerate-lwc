// caseForm1.js
import { LightningElement, track } from 'lwc';

export default class CaseForm1 extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    stateOptions = [
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        { label: 'Texas', value: 'TX' }
    ];

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        }
    }

    handleClear() {
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(element => {
            element.value = '';
        });
        this.formData = {};
        this.errorMessage = '';
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
        let isValid = true;
        let errors = [];

        inputs.forEach(input => {
            if (input.required && !input.value) {
                isValid = false;
                errors.push(`${input.label} is required`);
            }
        });

        if (this.formData.birthdate) {
            const birthDate = new Date(this.formData.birthdate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 18) {
                isValid = false;
                errors.push('Applicant must be older than 18 years');
            }
        }

        if (this.formData.startDate && this.formData.endDate) {
            if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
                isValid = false;
                errors.push('Start Date must be earlier than End Date');
            }
        }

        this.errorMessage = errors.join('. ');
        return isValid;
    }
}