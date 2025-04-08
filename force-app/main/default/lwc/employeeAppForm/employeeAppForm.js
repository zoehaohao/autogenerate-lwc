// employeeAppForm.js
import { LightningElement, track } from 'lwc';
export default class EmployeeAppForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    today = new Date().toISOString().split('T')[0];
    validateField(event) {
        const fieldName = event.target.label;
        const value = event.target.value;
        this.formData[fieldName] = value;
        this.errors[fieldName] = '';
        switch (fieldName) {
            case 'Full Name':
            case 'Position Applied For':
            case 'School/Institution':
            case 'Degree/Certification':
            case 'Most Recent Employer':
            case 'Job Title':
            case 'Signature':
                if (!value) this.errors[fieldName] = `${fieldName} is required`;
                break;
            case 'Phone Number':
                if (!/^\+?[1-9]\d{1,14}$/.test(value)) this.errors[fieldName] = 'Invalid phone number';
                break;
            case 'Email Address':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) this.errors[fieldName] = 'Invalid email address';
                break;
            case 'Resume Link':
                if (!/^https?:\/\/.*/.test(value)) this.errors[fieldName] = 'Invalid URL';
                break;
            case 'Desired Salary':
                if (isNaN(value) || Number(value) <= 0) this.errors[fieldName] = 'Must be a positive number';
                break;
            case 'Year Graduated':
                const currentYear = new Date().getFullYear();
                if (isNaN(value) || Number(value) < 1900 || Number(value) > currentYear) {
                    this.errors[fieldName] = `Must be between 1900 and ${currentYear}`;
                }
                break;
            case 'Employment Start Date':
            case 'Employment End Date':
                if (!value) this.errors[fieldName] = `${fieldName} is required`;
                else if (this.formData['Employment Start Date'] && this.formData['Employment End Date']) {
                    if (new Date(this.formData['Employment Start Date']) >= new Date(this.formData['Employment End Date'])) {
                        this.errors['Employment End Date'] = 'End date must be after start date';
                    }
                }
                break;
            case 'Cover Letter':
                if (!value) this.errors[fieldName] = 'Cover Letter is required';
                break;
            case 'Date':
                if (!value) this.errors[fieldName] = 'Date is required';
                break;
        }
        this.checkFormValidity();
    }
    checkFormValidity() {
        const isValid = Object.values(this.errors).every(error => !error) &&
                        Object.keys(this.formData).length === 15;
        this.template.querySelector('lightning-button[label="Submit"]').disabled = !isValid;
    }
    handleSubmit() {
        if (Object.values(this.errors).every(error => !error)) {
            console.log('Form submitted:', this.formData);
        }
    }
    handleClear() {
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(input => {
            input.value = '';
        });
        this.formData = {};
        this.errors = {};
        this.checkFormValidity();
    }
}