import { LightningElement, track } from 'lwc';

export default class QfrFormTest extends LightningElement {
    @track personalInfo = {
        name: ''
    };

    @track addressInfo = {
        address: ''
    };

    @track isProcessing = false;
    @track showSuccessMessage = false;
    @track showErrorMessage = false;
    @track errorMessage = '';

    // Getters for computed properties
    get nameInputClass() {
        return this.personalInfo.name ? 'slds-has-value' : '';
    }

    get submitDisabled() {
        return this.isProcessing || !this.personalInfo.name.trim();
    }

    // Event Handlers
    handlePersonalInfoChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.personalInfo = {
            ...this.personalInfo,
            [fieldName]: fieldValue
        };

        // Clear any existing messages when user starts typing
        this.clearMessages();
    }

    handleAddressChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.addressInfo = {
            ...this.addressInfo,
            [fieldName]: fieldValue
        };

        // Clear any existing messages when user starts typing
        this.clearMessages();
    }

    handleSubmit(event) {
        event.preventDefault();
        
        try {
            // Validate form
            if (!this.validateForm()) {
                return;
            }

            // Start processing
            this.isProcessing = true;
            this.clearMessages();

            // Simulate form submission
            this.processFormSubmission();

        } catch (error) {
            this.handleError('An unexpected error occurred while submitting the form.');
        }
    }

    handleClear() {
        try {
            // Reset form data
            this.personalInfo = {
                name: ''
            };
            
            this.addressInfo = {
                address: ''
            };

            // Clear messages
            this.clearMessages();

            // Reset form validation
            this.resetFormValidation();

        } catch (error) {
            this.handleError('An error occurred while clearing the form.');
        }
    }

    // Validation Methods
    validateForm() {
        let isValid = true;
        const inputFields = this.template.querySelectorAll('lightning-input');

        // Validate each input field
        inputFields.forEach(field => {
            if (!field.checkValidity()) {
                field.reportValidity();
                isValid = false;
            }
        });

        // Custom validation for required name field
        if (!this.personalInfo.name || !this.personalInfo.name.trim()) {
            this.handleError('Name is required.');
            isValid = false;
        }

        // Validate name length
        if (this.personalInfo.name && this.personalInfo.name.trim().length < 2) {
            this.handleError('Name must be at least 2 characters long.');
            isValid = false;
        }

        // Validate name format (letters, spaces, hyphens, apostrophes only)
        if (this.personalInfo.name && this.personalInfo.name.trim()) {
            const namePattern = /^[a-zA-Z\s\-']+$/;
            if (!namePattern.test(this.personalInfo.name.trim())) {
                this.handleError('Name can only contain letters, spaces, hyphens, and apostrophes.');
                isValid = false;
            }
        }

        return isValid;
    }

    resetFormValidation() {
        // Reset validation state on all input fields
        const inputFields = this.template.querySelectorAll('lightning-input');
        inputFields.forEach(field => {
            field.setCustomValidity('');
            field.reportValidity();
        });
    }

    // Form Processing
    processFormSubmission() {
        // Simulate async processing with setTimeout
        setTimeout(() => {
            try {
                // Simulate successful submission
                this.handleSuccess();
                
                // Log form data (in real implementation, this would be sent to server)
                console.log('Form Data Submitted:', {
                    personalInfo: this.personalInfo,
                    addressInfo: this.addressInfo,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                this.handleError('Failed to process form submission.');
            } finally {
                this.isProcessing = false;
            }
        }, 2000); // 2 second delay to simulate processing
    }

    // Message Handling
    handleSuccess() {
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        this.errorMessage = '';
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
            this.showSuccessMessage = false;
        }, 5000);
    }

    handleError(message) {
        this.showErrorMessage = true;
        this.showSuccessMessage = false;
        this.errorMessage = message;
        this.isProcessing = false;
        
        // Auto-hide error message after 8 seconds
        setTimeout(() => {
            this.showErrorMessage = false;
            this.errorMessage = '';
        }, 8000);
    }

    clearMessages() {
        this.showSuccessMessage = false;
        this.showErrorMessage = false;
        this.errorMessage = '';
    }

    // Lifecycle Hooks
    connectedCallback() {
        // Initialize component
        this.clearMessages();
    }

    renderedCallback() {
        // Focus on name field when component renders
        if (!this.personalInfo.name) {
            const nameInput = this.template.querySelector('[data-id="name-input"]');
            if (nameInput) {
                setTimeout(() => {
                    nameInput.focus();
                }, 100);
            }
        }
    }

    // Utility Methods
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/\s+/g, ' '); // Remove extra whitespace
    }

    formatFormData() {
        return {
            personalInfo: {
                name: this.sanitizeInput(this.personalInfo.name)
            },
            addressInfo: {
                address: this.sanitizeInput(this.addressInfo.address)
            },
            submittedAt: new Date().toISOString()
        };
    }
}
