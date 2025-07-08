import { LightningElement, track } from 'lwc';

export default class QfrFormTest extends LightningElement {
    @track personalInfo = {
        name: '',
        email: '',
        phone: ''
    };

    @track addressInfo = {
        address: '',
        city: '',
        state: '',
        zipCode: ''
    };

    @track isLoading = false;
    @track showSuccessMessage = false;
    @track showErrorMessage = false;
    @track errorMessage = '';

    // Handle personal information field changes
    handlePersonalInfoChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        
        this.personalInfo = {
            ...this.personalInfo,
            [field]: value
        };

        // Clear any existing messages when user starts typing
        this.clearMessages();
    }

    // Handle address field changes
    handleAddressChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        
        this.addressInfo = {
            ...this.addressInfo,
            [field]: value
        };

        // Clear any existing messages when user starts typing
        this.clearMessages();
    }

    // Getter for submit button disabled state
    get isSubmitDisabled() {
        return this.isLoading || !this.personalInfo.name.trim();
    }

    // Clear all form fields
    handleClear() {
        this.personalInfo = {
            name: '',
            email: '',
            phone: ''
        };

        this.addressInfo = {
            address: '',
            city: '',
            state: '',
            zipCode: ''
        };

        this.clearMessages();
    }

    // Handle form submission
    async handleSubmit() {
        try {
            // Validate required fields
            if (!this.validateForm()) {
                return;
            }

            this.isLoading = true;
            this.clearMessages();

            // Simulate API call delay
            await this.simulateApiCall();

            // Show success message
            this.showSuccessMessage = true;
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                this.showSuccessMessage = false;
            }, 3000);

        } catch (error) {
            this.errorMessage = 'An error occurred while submitting the form. Please try again.';
            this.showErrorMessage = true;
            
            // Auto-hide error message after 5 seconds
            setTimeout(() => {
                this.showErrorMessage = false;
            }, 5000);
        } finally {
            this.isLoading = false;
        }
    }

    // Validate form fields
    validateForm() {
        let isValid = true;
        const inputFields = this.template.querySelectorAll('lightning-input');

        inputFields.forEach(field => {
            if (field.required && !field.value.trim()) {
                field.setCustomValidity('This field is required');
                field.reportValidity();
                isValid = false;
            } else if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
                field.setCustomValidity('Please enter a valid email address');
                field.reportValidity();
                isValid = false;
            } else {
                field.setCustomValidity('');
                field.reportValidity();
            }
        });

        if (!isValid) {
            this.errorMessage = 'Please correct the errors in the form before submitting.';
            this.showErrorMessage = true;
            
            setTimeout(() => {
                this.showErrorMessage = false;
            }, 5000);
        }

        return isValid;
    }

    // Email validation helper
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Simulate API call
    simulateApiCall() {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form Data Submitted:', {
                    personalInfo: this.personalInfo,
                    addressInfo: this.addressInfo
                });
                resolve();
            }, 2000);
        });
    }

    // Clear all messages
    clearMessages() {
        this.showSuccessMessage = false;
        this.showErrorMessage = false;
        this.errorMessage = '';
    }

    // Component lifecycle - called when component is inserted into DOM
    connectedCallback() {
        console.log('QfrFormTest component loaded');
    }

    // Component lifecycle - called after component renders
    renderedCallback() {
        // Focus on the first input field when component loads
        const firstInput = this.template.querySelector('lightning-input[name="name"]');
        if (firstInput && !this.hasInitialFocus) {
            firstInput.focus();
            this.hasInitialFocus = true;
        }
    }
}
