// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        maritalStatus: '',
        nationality: '',
        ssn: '',
        driversLicense: '',
        email: '',
        phone: '',
        preferredContact: '',
        newsletter: false,
        altPhone: '',
        socialMedia: '',
        skype: '',
        fax: ''
    };

    @track errors = {};
    @track formErrors = [];
    
    get isSubmitDisabled() {
        return Object.keys(this.errors).length > 0 || !this.isFormValid();
    }

    validateField(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.errors[field] = '';

        switch(field) {
            case 'firstName':
            case 'lastName':
                if (!value.match(/^[A-Za-z]+$/)) {
                    this.errors[field] = 'Only letters are allowed';
                }
                break;
            case 'email':
                if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    this.errors[field] = 'Please enter a valid email address';
                }
                break;
            case 'phone':
            case 'altPhone':
                if (value && !value.match(/^\(\d{3}\) \d{3}-\d{4}$/)) {
                    this.errors[field] = 'Please enter phone in (XXX) XXX-XXXX format';
                }
                break;
            case 'ssn':
                if (!value.match(/^\d{3}-\d{2}-\d{4}$/)) {
                    this.errors[field] = 'Please enter SSN in XXX-XX-XXXX format';
                }
                break;
        }

        this.updateFormValidity();
    }

    handleFieldChange(event) {
        const field = event.target.name || event.target.dataset.field;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        this.formData[field] = value;
        this.validateField(event);
    }

    isFormValid() {
        const requiredFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 
                              'nationality', 'ssn', 'email', 'phone', 'preferredContact'];
        
        return requiredFields.every(field => this.formData[field]);
    }

    updateFormValidity() {
        this.formErrors = Object.values(this.errors).filter(error => error);
    }

    handleSubmit() {
        if (this.isFormValid() && Object.keys(this.errors).length === 0) {
            // Handle form submission
            console.log('Form submitted:', this.formData);
        } else {
            this.updateFormValidity();
        }
    }

    handleSaveDraft() {
        // Handle save draft functionality
        console.log('Form saved as draft:', this.formData);
    }

    handleClear() {
        this.formData = {};
        this.errors = {};
        this.formErrors = [];
        
        this.template.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
    }
}