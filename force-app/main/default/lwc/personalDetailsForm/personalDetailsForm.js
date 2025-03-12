// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        this.formData[field] = value;
        this.validateField(field, value);
    }

    validateField(field, value) {
        this.errors[field] = '';

        switch (field) {
            case 'fullName':
            case 'positionAppliedFor':
            case 'schoolInstitution':
            case 'degreeCertification':
            case 'mostRecentEmployer':
            case 'jobTitle':
            case 'signature':
                if (!value || value.trim() === '') {
                    this.errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
                }
                break;
            case 'phoneNumber':
                if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(value)) {
                    this.errors[field] = 'Please enter a valid phone number in the format (###) ###-####';
                }
                break;
            case 'emailAddress':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    this.errors[field] = 'Please enter a valid email address';
                }
                break;
            case 'resumeLink':
                if (!/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(value)) {
                    this.errors[field] = 'Please enter a valid URL';
                }
                break;
            case 'desiredSalary':
                if (isNaN(value) || value <= 0) {
                    this.errors[field] = 'Please enter a valid salary amount';
                }
                break;
            case 'yearGraduated':
                if (!/^\d{4}$/.test(value) || parseInt(value) < 1900 || parseInt(value) > new Date().getFullYear()) {
                    this.errors[field] = 'Please enter a valid 4-digit year';
                }
                break;
            case 'employmentDates':
                if (!/^[a-zA-Z0-9\s\-\/]+$/.test(value)) {
                    this.errors[field] = 'Please enter valid employment dates';
                }
                break;
            case 'coverLetter':
                if (!value || value.trim() === '') {
                    this.errors[field] = 'Cover letter is required';
                }
                break;
            case 'date':
                if (!value) {
                    this.errors[field] = 'Date is required';
                }
                break;
        }
    }

    validateForm() {
        let isValid = true;
        Object.keys(this.formData).forEach(field => {
            this.validateField(field, this.formData[field]);
            if (this.errors[field]) {
                isValid = false;
            }
        });
        return isValid;
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Here you would typically send the form data to a server
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Application submitted successfully', 'success');
            this.resetForm();
        } else {
            this.showToast('Error', 'Please correct the errors in the form', 'error');
        }
    }

    resetForm() {
        this.formData = {};
        this.errors = {};
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(element => {
            element.value = '';
        });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}