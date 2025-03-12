// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    connectedCallback() {
        this.currentDate = new Date().toISOString().split('T')[0];
    }

    validateField(event) {
        const fieldName = event.target.label;
        const fieldValue = event.target.value;
        
        // Clear previous error for this field
        this.errors[fieldName] = '';

        // Perform field-specific validations
        switch(fieldName) {
            case 'Full Name':
            case 'Position Applied For':
            case 'School/Institution':
            case 'Degree/Certification':
            case 'Most Recent Employer':
            case 'Job Title':
            case 'Employment Dates':
            case 'Cover Letter':
                if (!fieldValue.trim()) {
                    this.errors[fieldName] = `${fieldName} is required`;
                }
                break;
            case 'Phone Number':
                if (!/^\+?[\d\s-]{10,}$/.test(fieldValue)) {
                    this.errors[fieldName] = 'Please enter a valid phone number';
                }
                break;
            case 'Email Address':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
                    this.errors[fieldName] = 'Please enter a valid email address';
                }
                break;
            case 'Resume Link':
                if (fieldValue && !/^https?:\/\/.*/.test(fieldValue)) {
                    this.errors[fieldName] = 'Please enter a valid URL';
                }
                break;
            case 'Desired Salary (USD)':
                if (isNaN(fieldValue) || Number(fieldValue) <= 0) {
                    this.errors[fieldName] = 'Please enter a positive number';
                }
                break;
            case 'Year Graduated':
                const currentYear = new Date().getFullYear();
                if (isNaN(fieldValue) || Number(fieldValue) > currentYear || Number(fieldValue) < 1900) {
                    this.errors[fieldName] = 'Please enter a valid year';
                }
                break;
            case 'Signature':
                if (!fieldValue.trim()) {
                    this.errors[fieldName] = 'Signature is required';
                }
                break;
            case 'Date':
                if (!fieldValue) {
                    this.errors[fieldName] = 'Date is required';
                }
                break;
        }

        // Update formData
        this.formData[fieldName] = fieldValue;
    }

    handleSubmit() {
        // Validate all fields
        this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-input-rich-text').forEach(input => {
            this.validateField({ target: input });
        });

        // Check if there are any errors
        const hasErrors = Object.values(this.errors).some(error => error !== '');

        if (hasErrors) {
            // Display error toast
            this.showToast('Error', 'Please correct the errors in the form', 'error');
        } else {
            // Form is valid, proceed with submission
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Form submitted successfully', 'success');
            // Here you would typically send the data to a server
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}