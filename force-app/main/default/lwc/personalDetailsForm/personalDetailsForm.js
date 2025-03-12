// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    validateField(event) {
        const fieldName = event.target.label;
        const fieldValue = event.target.value;
        
        // Clear previous error for this field
        delete this.errors[fieldName];

        // Perform validation based on field type
        switch(fieldName) {
            case 'Full Name':
            case 'Position Applied For':
            case 'School/Institution':
            case 'Degree/Certification':
            case 'Most Recent Employer':
            case 'Job Title':
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
                if (isNaN(fieldValue) || fieldValue <= 0) {
                    this.errors[fieldName] = 'Please enter a valid salary amount';
                }
                break;
            case 'Year Graduated':
                const year = parseInt(fieldValue);
                if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
                    this.errors[fieldName] = 'Please enter a valid year';
                }
                break;
            case 'Employment Dates':
                if (!/^\d{2}\/\d{2}\/\d{4}\s-\s\d{2}\/\d{2}\/\d{4}$/.test(fieldValue)) {
                    this.errors[fieldName] = 'Please enter dates in the format MM/DD/YYYY - MM/DD/YYYY';
                }
                break;
            case 'Date':
                if (!fieldValue) {
                    this.errors[fieldName] = 'Please select a date';
                }
                break;
        }

        // Update formData
        this.formData[fieldName] = fieldValue;

        // Force re-render to show/hide error messages
        this.template.querySelector(`[label="${fieldName}"]`).reportValidity();
    }

    handleSubmit() {
        // Validate all fields
        this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-input-field').forEach(input => {
            this.validateField({ target: input });
        });

        // Check if there are any errors
        if (Object.keys(this.errors).length === 0) {
            // Form is valid, proceed with submission
            console.log('Form data:', this.formData);
            this.showToast('Success', 'Form submitted successfully', 'success');
            // Here you would typically send the data to a server
        } else {
            // Form has errors
            this.showToast('Error', 'Please correct the errors in the form', 'error');
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