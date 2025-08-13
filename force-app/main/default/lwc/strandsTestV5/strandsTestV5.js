// strandsTestV5.js
import { LightningElement, api } from 'lwc';

export default class StrandsTestV5 extends LightningElement {
    @api recordId;
    
    firstName = '';
    lastName = '';
    email = '';
    phone = '';
    
    firstNameError = '';
    lastNameError = '';
    emailError = '';
    showSuccessMessage = false;

    get firstNameClass() {
        return this.firstNameError ? 'slds-has-error' : '';
    }

    get lastNameClass() {
        return this.lastNameError ? 'slds-has-error' : '';
    }

    get emailClass() {
        return this.emailError ? 'slds-has-error' : '';
    }

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.validateFirstName();
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
        this.validateLastName();
    }

    handleEmailChange(event) {
        this.email = event.target.value;
        this.validateEmail();
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
    }

    validateFirstName() {
        if (!this.firstName || this.firstName.trim().length === 0) {
            this.firstNameError = 'First Name is required';
            return false;
        }
        this.firstNameError = '';
        return true;
    }

    validateLastName() {
        if (!this.lastName || this.lastName.trim().length === 0) {
            this.lastNameError = 'Last Name is required';
            return false;
        }
        this.lastNameError = '';
        return true;
    }

    validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.email || !emailRegex.test(this.email)) {
            this.emailError = 'Please enter a valid email address';
            return false;
        }
        this.emailError = '';
        return true;
    }

    validateForm() {
        const isFirstNameValid = this.validateFirstName();
        const isLastNameValid = this.validateLastName();
        const isEmailValid = this.validateEmail();
        
        return isFirstNameValid && isLastNameValid && isEmailValid;
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Dispatch custom event with form data
            const formData = {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone
            };

            this.dispatchEvent(new CustomEvent('formsubmit', {
                detail: formData,
                bubbles: true,
                composed: true
            }));

            // Show success message
            this.showSuccessMessage = true;
            setTimeout(() => {
                this.showSuccessMessage = false;
            }, 3000);

            // Reset form
            this.handleReset();
        }
    }

    handleReset() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.firstNameError = '';
        this.lastNameError = '';
        this.emailError = '';
        
        // Reset all lightning-input fields
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
    }
}