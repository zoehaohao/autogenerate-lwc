import { LightningElement, track } from 'lwc';

export default class QfrFormTest extends LightningElement {
    @track personalInfo = {
        name: ''
    };

    @track addressInfo = {
        address: ''
    };

    @track errors = {};
    @track isProcessing = false;
    @track showSuccess = false;

    // Computed properties for CSS classes
    get nameInputClass() {
        return this.errors.name ? 'slds-has-error' : '';
    }

    get addressInputClass() {
        return this.errors.address ? 'slds-has-error' : '';
    }

    get submitDisabled() {
        return this.isProcessing || !this.isFormValid;
    }

    get isFormValid() {
        return this.personalInfo.name && this.personalInfo.name.trim().length > 0;
    }

    // Event Handlers
    handlePersonalInfoChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.personalInfo = {
            ...this.personalInfo,
            [fieldName]: fieldValue
        };

        // Clear error when user starts typing
        if (this.errors[fieldName]) {
            this.errors = {
                ...this.errors,
                [fieldName]: null
            };
        }

        // Real-time validation
        this.validateField(fieldName, fieldValue);
    }

    handleAddressChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.addressInfo = {
            ...this.addressInfo,
            [fieldName]: fieldValue
        };

        // Clear error when user starts typing
        if (this.errors[fieldName]) {
            this.errors = {
                ...this.errors,
                [fieldName]: null
            };
        }

        // Real-time validation
        this.validateField(fieldName, fieldValue);
    }

    handleClear() {
        try {
            this.personalInfo = {
                name: ''
            };
            
            this.addressInfo = {
                address: ''
            };

            this.errors = {};
            this.showSuccess = false;

            // Clear form inputs
            const inputs = this.template.querySelectorAll('lightning-input');
            inputs.forEach(input => {
                input.value = '';
            });

        } catch (error) {
            console.error('Error clearing form:', error);
        }
    }

    async handleSubmit() {
        try {
            this.isProcessing = true;
            this.showSuccess = false;

            // Validate all fields
            const isValid = this.validateAllFields();

            if (!isValid) {
                this.isProcessing = false;
                return;
            }

            // Simulate processing time
            await this.simulateProcessing();

            // Process form data
            const formData = {
                personalInfo: { ...this.personalInfo },
                addressInfo: { ...this.addressInfo },
                submittedAt: new Date().toISOString()
            };

            console.log('Form Data Submitted:', formData);

            // Show success message
            this.showSuccess = true;

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                this.showSuccess = false;
            }, 5000);

        } catch (error) {
            console.error('Error submitting form:', error);
            this.showError('An error occurred while submitting the form. Please try again.');
        } finally {
            this.isProcessing = false;
        }
    }

    // Validation Methods
    validateField(fieldName, fieldValue) {
        let isValid = true;
        let errorMessage = null;

        switch (fieldName) {
            case 'name':
                if (!fieldValue || fieldValue.trim().length === 0) {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (fieldValue.trim().length < 2) {
                    errorMessage = 'Name must be at least 2 characters long';
                    isValid = false;
                } else if (fieldValue.trim().length > 100) {
                    errorMessage = 'Name cannot exceed 100 characters';
                    isValid = false;
                }
                break;

            case 'address':
                if (fieldValue && fieldValue.trim().length > 255) {
                    errorMessage = 'Address cannot exceed 255 characters';
                    isValid = false;
                }
                break;

            default:
                break;
        }

        // Update errors
        this.errors = {
            ...this.errors,
            [fieldName]: errorMessage
        };

        return isValid;
    }

    validateAllFields() {
        let isFormValid = true;

        // Validate name (required)
        const nameValid = this.validateField('name', this.personalInfo.name);
        if (!nameValid) {
            isFormValid = false;
        }

        // Validate address (optional but has constraints)
        const addressValid = this.validateField('address', this.addressInfo.address);
        if (!addressValid) {
            isFormValid = false;
        }

        return isFormValid;
    }

    // Helper Methods
    async simulateProcessing() {
        return new Promise(resolve => {
            setTimeout(resolve, 2000); // 2 second delay to simulate processing
        });
    }

    showError(message) {
        // You could implement a toast message or error display here
        console.error(message);
    }

    // Lifecycle Hooks
    connectedCallback() {
        // Initialize component
        console.log('QfrFormTest component connected');
    }

    renderedCallback() {
        // Focus on first input when component renders
        if (!this.hasRendered) {
            const nameInput = this.template.querySelector('[data-id="name-input"]');
            if (nameInput) {
                nameInput.focus();
            }
            this.hasRendered = true;
        }
    }
}
