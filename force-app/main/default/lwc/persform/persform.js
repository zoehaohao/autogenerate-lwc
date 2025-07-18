import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Persform extends LightningElement {
    // Public API properties for parent component communication
    @api recordId;
    @api initialData = {};
    @api isReadOnly = false;
    @api configSettings = {};

    // Tracked properties for form data and validation
    @track formData = {
        name: '',
        address: ''
    };
    
    @track validationErrors = [];

    // Component lifecycle
    connectedCallback() {
        this.initializeFormData();
    }

    // Initialize form data from parent or default values
    initializeFormData() {
        if (this.initialData && Object.keys(this.initialData).length > 0) {
            this.formData = { ...this.formData, ...this.initialData };
        }
    }

    // Getters for computed properties
    get hasValidationErrors() {
        return this.validationErrors && this.validationErrors.length > 0;
    }

    get isFormValid() {
        return this.validateForm();
    }

    // Event handlers
    handleInputChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        const oldValue = this.formData[fieldName];

        // Update form data
        this.formData = {
            ...this.formData,
            [fieldName]: fieldValue
        };

        // Clear validation errors for this field
        this.clearFieldValidationError(fieldName);

        // Dispatch change event to parent
        this.dispatchDataChangeEvent(fieldName, fieldValue, oldValue);
    }

    handleSave(event) {
        try {
            if (this.validateForm()) {
                // Clear any existing validation errors
                this.validationErrors = [];
                
                // Dispatch success event to parent
                this.dispatchSuccessEvent({
                    action: 'save',
                    data: this.formData
                });

                // Show success toast
                this.showToast('Success', 'Form saved successfully!', 'success');
            } else {
                // Show validation errors
                this.showToast('Error', 'Please correct the validation errors.', 'error');
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    handleReset(event) {
        try {
            // Reset form data
            this.formData = {
                name: '',
                address: ''
            };

            // Clear validation errors
            this.validationErrors = [];

            // Dispatch reset event to parent
            this.dispatchSuccessEvent({
                action: 'reset',
                data: this.formData
            });

            // Show success toast
            this.showToast('Success', 'Form reset successfully!', 'success');
        } catch (error) {
            this.handleError(error);
        }
    }

    // Validation methods
    validateForm() {
        this.validationErrors = [];
        let isValid = true;

        // Validate required name field
        if (!this.formData.name || this.formData.name.trim() === '') {
            this.validationErrors.push('Name is required');
            isValid = false;
        }

        // Additional validation can be added here
        if (this.formData.name && this.formData.name.length > 100) {
            this.validationErrors.push('Name must be less than 100 characters');
            isValid = false;
        }

        if (this.formData.address && this.formData.address.length > 255) {
            this.validationErrors.push('Address must be less than 255 characters');
            isValid = false;
        }

        return isValid;
    }

    validateField(fieldName, value) {
        switch (fieldName) {
            case 'name':
                return value && value.trim() !== '' && value.length <= 100;
            case 'address':
                return !value || value.length <= 255;
            default:
                return true;
        }
    }

    clearFieldValidationError(fieldName) {
        const fieldErrors = {
            'name': ['Name is required', 'Name must be less than 100 characters'],
            'address': ['Address must be less than 255 characters']
        };

        if (fieldErrors[fieldName]) {
            this.validationErrors = this.validationErrors.filter(error => 
                !fieldErrors[fieldName].includes(error)
            );
        }
    }

    // Public API methods for parent component
    @api
    validateComponent() {
        return this.validateForm();
    }

    @api
    getFormData() {
        return { ...this.formData };
    }

    @api
    setFormData(data) {
        if (data && typeof data === 'object') {
            this.formData = { ...this.formData, ...data };
        }
    }

    @api
    resetForm() {
        this.handleReset();
    }

    @api
    refreshData() {
        this.initializeFormData();
    }

    // Event dispatching methods for parent communication
    dispatchDataChangeEvent(fieldName, newValue, oldValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'persform',
                fieldName: fieldName,
                newValue: newValue,
                oldValue: oldValue,
                isValid: this.validateField(fieldName, newValue),
                formData: this.getFormData(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    dispatchSuccessEvent(result) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'persform',
                result: result,
                message: 'Operation completed successfully',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'persform',
                errorMessage: error.message || 'An error occurred',
                errorCode: error.code || 'UNKNOWN_ERROR',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    // Utility methods
    handleError(error) {
        console.error('Persform Error:', error);
        this.dispatchErrorEvent(error);
        this.showToast('Error', error.message || 'An unexpected error occurred', 'error');
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
