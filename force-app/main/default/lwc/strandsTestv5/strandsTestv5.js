import { LightningElement, track } from 'lwc';

export default class StrandsTestv5 extends LightningElement {
    @track contactName = '';
    @track contactTitle = '';
    @track contactPhone = '';
    @track contactEmail = '';
    
    @track nameError = '';
    @track phoneError = '';
    @track emailError = '';
    @track error = '';

    // Computed properties for input styling
    get nameInputClass() {
        return `slds-input ${this.nameError ? 'slds-has-error' : ''}`;
    }

    get phoneInputClass() {
        return `slds-input ${this.phoneError ? 'slds-has-error' : ''}`;
    }

    get emailInputClass() {
        return `slds-input ${this.emailError ? 'slds-has-error' : ''}`;
    }

    get isSubmitDisabled() {
        return !this.contactName || !this.contactPhone || !this.contactEmail ||
               this.nameError || this.phoneError || this.emailError;
    }

    // Event Handlers
    handleNameChange(event) {
        this.contactName = event.target.value;
        this.validateName();
    }

    handleTitleChange(event) {
        this.contactTitle = event.target.value;
    }

    handlePhoneChange(event) {
        this.contactPhone = event.target.value;
        this.validatePhone();
    }

    handleEmailChange(event) {
        this.contactEmail = event.target.value;
        this.validateEmail();
    }

    // Validation Methods
    validateName() {
        if (!this.contactName) {
            this.nameError = 'Name is required';
            return false;
        }
        if (this.contactName.length < 2) {
            this.nameError = 'Name must be at least 2 characters';
            return false;
        }
        this.nameError = '';
        return true;
    }

    validatePhone() {
        const phoneRegex = /^\d{10}$/;
        if (!this.contactPhone) {
            this.phoneError = 'Phone is required';
            return false;
        }
        if (!phoneRegex.test(this.contactPhone)) {
            this.phoneError = 'Please enter a valid 10-digit phone number';
            return false;
        }
        this.phoneError = '';
        return true;
    }

    validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.contactEmail) {
            this.emailError = 'Email is required';
            return false;
        }
        if (!emailRegex.test(this.contactEmail)) {
            this.emailError = 'Please enter a valid email address';
            return false;
        }
        this.emailError = '';
        return true;
    }

    validateAll() {
        const nameValid = this.validateName();
        const phoneValid = this.validatePhone();
        const emailValid = this.validateEmail();
        return nameValid && phoneValid && emailValid;
    }

    // Action Methods
    handleSubmit() {
        if (!this.validateAll()) {
            this.error = 'Please correct the errors before submitting.';
            return;
        }

        // Create contact data object
        const contactData = {
            name: this.contactName,
            title: this.contactTitle,
            phone: this.contactPhone,
            email: this.contactEmail
        };

        // Dispatch custom event with contact data
        const submitEvent = new CustomEvent('submitcontact', {
            detail: contactData,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(submitEvent);

        // Reset form after successful submission
        this.handleReset();
    }

    handleReset() {
        this.contactName = '';
        this.contactTitle = '';
        this.contactPhone = '';
        this.contactEmail = '';
        this.clearErrors();
    }

    clearErrors() {
        this.nameError = '';
        this.phoneError = '';
        this.emailError = '';
        this.error = '';
    }

    clearError() {
        this.error = '';
    }
}