// validationForm.js
import { LightningElement, track } from 'lwc';

export default class ValidationForm extends LightningElement {
    @track name = '';
    @track email = '';
    @track phone = '';
    @track age = null;
    @track website = '';
    
    @track nameError = '';
    @track emailError = '';
    @track phoneError = '';
    @track ageError = '';
    @track websiteError = '';
    @track formError = '';
    @track successMessage = '';

    get nameFieldClass() {
        return `slds-form-element ${this.nameError ? 'slds-has-error' : ''}`;
    }

    get emailFieldClass() {
        return `slds-form-element ${this.emailError ? 'slds-has-error' : ''}`;
    }

    get phoneFieldClass() {
        return `slds-form-element ${this.phoneError ? 'slds-has-error' : ''}`;
    }

    get ageFieldClass() {
        return `slds-form-element ${this.ageError ? 'slds-has-error' : ''}`;
    }

    get urlFieldClass() {
        return `slds-form-element ${this.websiteError ? 'slds-has-error' : ''}`;
    }

    get isSubmitDisabled() {
        return !this.name || !this.email || !this.age || 
               this.nameError || this.emailError || this.phoneError || 
               this.ageError || this.websiteError;
    }

    handleNameChange(event) {
        this.name = event.target.value;
        this.validateName();
    }

    handleEmailChange(event) {
        this.email = event.target.value;
        this.validateEmail();
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
        this.validatePhone();
    }

    handleAgeChange(event) {
        this.age = event.target.value;
        this.validateAge();
    }

    handleWebsiteChange(event) {
        this.website = event.target.value;
        this.validateWebsite();
    }

    validateName() {
        if (!this.name) {
            this.nameError = 'Name is required';
            return false;
        }
        if (this.name.length < 2) {
            this.nameError = 'Name must be at least 2 characters';
            return false;
        }
        if (this.name.length > 50) {
            this.nameError = 'Name must not exceed 50 characters';
            return false;
        }
        this.nameError = '';
        return true;
    }

    validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.email) {
            this.emailError = 'Email is required';
            return false;
        }
        if (!emailRegex.test(this.email)) {
            this.emailError = 'Please enter a valid email address';
            return false;
        }
        this.emailError = '';
        return true;
    }

    validatePhone() {
        if (!this.phone) {
            this.phoneError = '';
            return true;
        }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(this.phone)) {
            this.phoneError = 'Please enter a valid 10-digit phone number';
            return false;
        }
        this.phoneError = '';
        return true;
    }

    validateAge() {
        if (!this.age) {
            this.ageError = 'Age is required';
            return false;
        }
        const ageNum = Number(this.age);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
            this.ageError = 'Age must be between 18 and 120';
            return false;
        }
        this.ageError = '';
        return true;
    }

    validateWebsite() {
        if (!this.website) {
            this.websiteError = '';
            return true;
        }
        try {
            new URL(this.website);
            this.websiteError = '';
            return true;
        } catch (e) {
            this.websiteError = 'Please enter a valid URL';
            return false;
        }
    }

    handleSubmit() {
        this.formError = '';
        this.successMessage = '';

        const isValid = 
            this.validateName() &&
            this.validateEmail() &&
            this.validatePhone() &&
            this.validateAge() &&
            this.validateWebsite();

        if (!isValid) {
            this.formError = 'Please correct the errors before submitting.';
            return;
        }

        try {
            const formData = {
                name: this.name,
                email: this.email,
                phone: this.phone,
                age: this.age,
                website: this.website
            };
            
            console.log('Form submitted:', formData);
            this.successMessage = 'Form submitted successfully!';
            this.resetForm();
        } catch (error) {
            this.formError = 'An error occurred while submitting the form. Please try again.';
        }
    }

    resetForm() {
        this.name = '';
        this.email = '';
        this.phone = '';
        this.age = null;
        this.website = '';
        this.nameError = '';
        this.emailError = '';
        this.phoneError = '';
        this.ageError = '';
        this.websiteError = '';
    }
}