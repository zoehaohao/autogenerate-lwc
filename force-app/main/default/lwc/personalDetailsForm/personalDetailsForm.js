// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    currentYear = new Date().getFullYear();

    handleInputValidation(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }

    validateField(fieldName, value) {
        this.errors[fieldName] = '';

        switch(fieldName) {
            case 'fullName':
            case 'positionAppliedFor':
            case 'schoolInstitution':
            case 'degreeCertification':
            case 'mostRecentEmployer':
            case 'jobTitle':
            case 'employmentDates':
            case 'coverLetter':
            case 'signature':
                if (!value || value.trim() === '') {
                    this.errors[fieldName] = 'This field is required.';
                }
                break;
            case 'phoneNumber':
                if (!value || !/^\+?[1-9]\d{1,14}$/.test(value)) {
                    this.errors[fieldName] = 'Please enter a valid phone number.';
                }
                break;
            case 'emailAddress':
                if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    this.errors[fieldName] = 'Please enter a valid email address.';
                }
                break;
            case 'resumeLink':
                if (value && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value)) {
                    this.errors[fieldName] = 'Please enter a valid URL.';
                }
                break;
            case 'desiredSalary':
                if (value && (isNaN(value) || parseFloat(value) < 0)) {
                    this.errors[fieldName] = 'Please enter a valid positive number.';
                }
                break;
            case 'yearGraduated':
                const year = parseInt(value);
                if (isNaN(year) || year < 1900 || year > this.currentYear) {
                    this.errors[fieldName] = 'Please enter a valid year between 1900 and ' + this.currentYear + '.';
                }
                break;
            case 'date':
                if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    this.errors[fieldName] = 'Please enter a valid date in the format YYYY-MM-DD.';
                }
                break;
        }
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(input => {
            if (input.required && !input.value) {
                this.errors[input.name] = 'This field is required.';
                isValid = false;
            }
        });
        return isValid;
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Here you would typically send the form data to a server
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Application submitted successfully!', 'success');
        } else {
            this.showToast('Error', 'Please correct the errors in the form.', 'error');
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