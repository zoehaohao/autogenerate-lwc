// qfrFormTest.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    // Form data properties
    @track formData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    };

    // Error tracking
    @track errors = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    };

    // UI state properties
    @track isLoading = false;
    @track showSuccessMessage = false;

    /**
     * Handles input field changes and performs real-time validation
     * @param {Event} event - Input change event
     */
    handleInputChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        // Update form data
        this.formData = {
            ...this.formData,
            [fieldName]: fieldValue
        };

        // Clear previous error for this field
        this.errors = {
            ...this.errors,
            [fieldName]: ''
        };

        // Perform field-specific validation on blur
        if (event.type === 'blur' || fieldValue.length > 0) {
            this.validateField(fieldName, fieldValue);
        }
    }

    /**
     * Validates individual form fields
     * @param {string} fieldName - Name of the field to validate
     * @param {string} fieldValue - Value to validate
     */
    validateField(fieldName, fieldValue) {
        let errorMessage = '';

        switch (fieldName) {
            case 'firstName':
                errorMessage = this.validateName(fieldValue, 'First name');
                break;
            case 'lastName':
                errorMessage = this.validateName(fieldValue, 'Last name');
                break;
            case 'email':
                errorMessage = this.validateEmail(fieldValue);
                break;
            case 'phone':
                errorMessage = this.validatePhone(fieldValue);
                break;
            case 'address':
                errorMessage = this.validateAddress(fieldValue);
                break;
        }

        this.errors = {
            ...this.errors,
            [fieldName]: errorMessage
        };
    }

    /**
     * Validates name fields (first name, last name)
     * @param {string} value - Name value to validate
     * @param {string} fieldLabel - Field label for error messages
     * @returns {string} Error message or empty string if valid
     */
    validateName(value, fieldLabel) {
        if (!value || value.trim().length === 0) {
            return `${fieldLabel} is required.`;
        }
        
        if (value.length > 50) {
            return `${fieldLabel} must be 50 characters or less.`;
        }
        
        const namePattern = /^[a-zA-Z\s'-]+$/;
        if (!namePattern.test(value)) {
            return `${fieldLabel} can only contain letters, spaces, hyphens, and apostrophes.`;
        }
        
        return '';
    }

    /**
     * Validates email field
     * @param {string} value - Email value to validate
     * @returns {string} Error message or empty string if valid
     */
    validateEmail(value) {
        if (!value || value.trim().length === 0) {
            return 'Email address is required.';
        }
        
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            return 'Please enter a valid email address (e.g., user@domain.com).';
        }
        
        return '';
    }

    /**
     * Validates phone field
     * @param {string} value - Phone value to validate
     * @returns {string} Error message or empty string if valid
     */
    validatePhone(value) {
        // Phone is optional, so empty is valid
        if (!value || value.trim().length === 0) {
            return '';
        }
        
        // Remove all non-digit characters for validation
        const digitsOnly = value.replace(/\D/g, '');
        
        if (digitsOnly.length < 10) {
            return 'Phone number must contain at least 10 digits.';
        }
        
        if (digitsOnly.length > 15) {
            return 'Phone number cannot exceed 15 digits.';
        }
        
        return '';
    }

    /**
     * Validates address field
     * @param {string} value - Address value to validate
     * @returns {string} Error message or empty string if valid
     */
    validateAddress(value) {
        // Address is optional, so empty is valid
        if (!value || value.trim().length === 0) {
            return '';
        }
        
        if (value.length > 200) {
            return 'Address must be 200 characters or less.';
        }
        
        return '';
    }

    /**
     * Validates all form fields
     * @returns {boolean} True if all fields are valid
     */
    validateAllFields() {
        let isValid = true;
        const newErrors = {};

        // Validate each field
        Object.keys(this.formData).forEach(fieldName => {
            const fieldValue = this.formData[fieldName];
            let errorMessage = '';

            switch (fieldName) {
                case 'firstName':
                    errorMessage = this.validateName(fieldValue, 'First name');
                    break;
                case 'lastName':
                    errorMessage = this.validateName(fieldValue, 'Last name');
                    break;
                case 'email':
                    errorMessage = this.validateEmail(fieldValue);
                    break;
                case 'phone':
                    errorMessage = this.validatePhone(fieldValue);
                    break;
                case 'address':
                    errorMessage = this.validateAddress(fieldValue);
                    break;
            }

            newErrors[fieldName] = errorMessage;
            if (errorMessage) {
                isValid = false;
            }
        });

        this.errors = newErrors;
        return isValid;
    }

    /**
     * Handles form submission
     * @param {Event} event - Form submit event
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        // Show loading state
        this.isLoading = true;
        this.showSuccessMessage = false;

        try {
            // Validate all fields
            if (!this.validateAllFields()) {
                this.showToast('Error', 'Please correct the errors before submitting.', 'error');
                return;
            }

            // Simulate API call delay
            await this.simulateApiCall();

            // Show success message
            this.showSuccessMessage = true;
            this.showToast('Success', 'Form submitted successfully!', 'success');

            // Scroll to top to show success message
            this.template.querySelector('lightning-card').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });

        } catch (error) {
            console.error('Form submission error:', error);
            this.showToast('Error', 'An error occurred while submitting the form. Please try again.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Handles form reset
     */
    handleReset() {
        // Reset form data
        this.formData = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: ''
        };

        // Clear all errors
        this.errors = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: ''
        };

        // Hide success message
        this.showSuccessMessage = false;

        // Show confirmation toast
        this.showToast('Info', 'Form has been reset.', 'info');
    }

    /**
     * Simulates an API call with delay
     * @returns {Promise} Promise that resolves after delay
     */
    simulateApiCall() {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data submitted:', JSON.stringify(this.formData, null, 2));
                resolve();
            }, 2000);
        });
    }

    /**
     * Shows toast notification
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} variant - Toast```js
     * Shows toast notification
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} variant - Toast variant (success, error, warning, info)
     */
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    // CSS class getters for conditional styling
    get firstNameCssClass() {
        return this.errors.firstName ? 'slds-has-error' : '';
    }

    get lastNameCssClass() {
        return this.errors.lastName ? 'slds-has-error' : '';
    }

    get emailCssClass() {
        return this.errors.email ? 'slds-has-error' : '';
    }

    get phoneCssClass() {
        return this.errors.phone ? 'slds-has-error' : '';
    }

    get addressCssClass() {
        return this.errors.address ? 'slds-has-error' : '';
    }

    get hasFormErrors() {
        return Object.values(this.errors).some(error => error !== '');
    }

    get submitDisabled() {
        return this.isLoading || this.hasFormErrors || !this.isFormComplete;
    }

    get isFormComplete() {
        return this.formData.firstName && 
               this.formData.lastName && 
               this.formData.email;
    }
}
