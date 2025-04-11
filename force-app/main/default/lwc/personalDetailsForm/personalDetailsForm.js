// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
    }
    validateField(fieldName, value) {
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
            case 'zipCode':
                if (!value.trim()) {
                    this.setFieldError(fieldName, 'This field is required');
                } else {
                    this.clearFieldError(fieldName);
                }
                break;
            case 'birthdate':
                if (!this.isOver18(value)) {
                    this.setFieldError(fieldName, 'You must be over 18 years old');
                } else {
                    this.clearFieldError(fieldName);
                }
                break;
            case 'startDate':
            case 'endDate':
                this.validateDateRange();
                break;
        }
    }
    isOver18(birthdate) {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }
    validateDateRange() {
        const startDate = new Date(this.formData.startDate);
        const endDate = new Date(this.formData.endDate);
        if (startDate && endDate && startDate >= endDate) {
            this.setFieldError('endDate', 'End Date must be later than Start Date');
        } else {
            this.clearFieldError('endDate');
        }
    }
    setFieldError(fieldName, message) {
        const field = this.template.querySelector(`[id="${fieldName}"]`);
        field.setCustomValidity(message);
        field.reportValidity();
    }
    clearFieldError(fieldName) {
        const field = this.template.querySelector(`[id="${fieldName}"]`);
        field.setCustomValidity('');
        field.reportValidity();
    }
    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please correct the errors in the form.';
        }
    }
    validateForm() {
        const allValid = [...this.template.querySelectorAll('input, select')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        return allValid;
    }
    handleReset() {
        this.formData = {};
        this.errorMessage = '';
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
            field.setCustomValidity('');
            field.reportValidity();
        });
    }
}