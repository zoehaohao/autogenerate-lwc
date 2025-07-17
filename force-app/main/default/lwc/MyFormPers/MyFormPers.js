import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
    // Public API properties for parent component communication
    @api recordId;
    @api initialData;
    @api isReadOnly = false;
    @api showSubmitButton = true;
    @api showResetButton = true;

    // Form data properties
    @track firstName = '';
    @track middleName = '';
    @track lastName = '';
    @track address = '';
    @track city = '';
    @track state = '';
    @track zipCode = '';

    // Validation and error handling
    @track errors = {};
    @track isFormValid = false;

    // State options for dropdown
    stateOptions = [
        { label: 'Alabama', value: 'AL' },
        { label: 'Alaska', value: 'AK' },
        { label: 'Arizona', value: 'AZ' },
        { label: 'Arkansas', value: 'AR' },
        { label: 'California', value: 'CA' },
        { label: 'Colorado', value: 'CO' },
        { label: 'Connecticut', value: 'CT' },
        { label: 'Delaware', value: 'DE' },
        { label: 'Florida', value: 'FL' },
        { label: 'Georgia', value: 'GA' },
        { label: 'Hawaii', value: 'HI' },
        { label: 'Idaho', value: 'ID' },
        { label: 'Illinois', value: 'IL' },
        { label: 'Indiana', value: 'IN' },
        { label: 'Iowa', value: 'IA' },
        { label: 'Kansas', value: 'KS' },
        { label: 'Kentucky', value: 'KY' },
        { label: 'Louisiana', value: 'LA' },
        { label: 'Maine', value: 'ME' },
        { label: 'Maryland', value: 'MD' },
        { label: 'Massachusetts', value: 'MA' },
        { label: 'Michigan', value: 'MI' },
        { label: 'Minnesota', value: 'MN' },
        { label: 'Mississippi', value: 'MS' },
        { label: 'Missouri', value: 'MO' },
        { label: 'Montana', value: 'MT' },
        { label: 'Nebraska', value: 'NE' },
        { label: 'Nevada', value: 'NV' },
        { label: 'New Hampshire', value: 'NH' },
        { label: 'New Jersey', value: 'NJ' },
        { label: 'New Mexico', value: 'NM' },
        { label: 'New York', value: 'NY' },
        { label: 'North Carolina', value: 'NC' },
        { label: 'North Dakota', value: 'ND' },
        { label: 'Ohio', value: 'OH' },
        { label: 'Oklahoma', value: 'OK' },
        { label: 'Oregon', value: 'OR' },
        { label: 'Pennsylvania', value: 'PA' },
        { label: 'Rhode Island', value: 'RI' },
        { label: 'South Carolina', value: 'SC' },
        { label: 'South Dakota', value: 'SD' },
        { label: 'Tennessee', value: 'TN' },
        { label: 'Texas', value: 'TX' },
        { label: 'Utah', value: 'UT' },
        { label: 'Vermont', value: 'VT' },
        { label: 'Virginia', value: 'VA' },
        { label: 'Washington', value: 'WA' },
        { label: 'West Virginia', value: 'WV' },
        { label: 'Wisconsin', value: 'WI' },
        { label: 'Wyoming', value: 'WY' }
    ];

    // Lifecycle hooks
    connectedCallback() {
        if (this.initialData) {
            this.populateFormData(this.initialData);
        }
        this.validateForm();
    }

    // Computed properties
    get isSubmitDisabled() {
        return !this.isFormValid || this.isReadOnly;
    }

    get formData() {
        return {
            firstName: this.firstName,
            middleName: this.middleName,
            lastName: this.lastName,
            address: this.address,
            city: this.city,
            state: this.state,
            zipCode: this.zipCode
        };
    }

    // Event handlers
    handleInputChange(event) {
        const fieldName = event.target.dataset.field;
        const value = event.target.value;
        
        // Update the field value
        this[fieldName] = value;
        
        // Clear any existing error for this field
        if (this.errors[fieldName]) {
            this.errors = { ...this.errors };
            delete this.errors[fieldName];
        }
        
        // Validate form
        this.validateForm();
        
        // Notify parent of data change
        this.dispatchDataChangeEvent(fieldName, value);
    }

    handleFieldValidation(event) {
        const fieldName = event.target.dataset.field;
        const value = event.target.value;
        
        this.validateField(fieldName, value);
        this.validateForm();
    }

    handleSubmit(event) {
        event.preventDefault();
        
        // Validate entire form before submission
        if (this.validateAllFields()) {
            const submitEvent = new CustomEvent('submit', {
                detail: {
                    componentName: 'MyFormPers',
                    formData: this.formData,
                    isValid: this.isFormValid,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(submitEvent);
            
            // Show success message
            this.showToast('Success', 'Form submitted successfully!', 'success');
        } else {
            this.showToast('Error', 'Please correct the errors before submitting.', 'error');
        }
    }

    handleReset() {
        // Reset all form fields
        this.firstName = '';
        this.middleName = '';
        this.lastName = '';
        this.address = '';
        this.city = '';
        this.state = '';
        this.zipCode = '';
        this.errors = {};
        this.isFormValid = false;
        
        // Notify parent of reset
        const resetEvent = new CustomEvent('reset', {
            detail: {
                componentName: 'MyFormPers',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(resetEvent);
        
        this.showToast('Info', 'Form has been reset.', 'info');
    }

    // Validation methods
    validateField(fieldName, value) {
        const errors = { ...this.errors };
        
        switch (fieldName) {
            case 'firstName':
                if (!value || value.trim().length === 0) {
                    errors.firstName = 'First name is required.';
                } else if (value.trim().length < 2) {
                    errors.firstName = 'First name must be at least 2 characters.';
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes.';
                }
                break;
                
            case 'lastName':
                if (!value || value.trim().length === 0) {
                    errors.lastName = 'Last name is required.';
                } else if (value.trim().length < 2) {
                    errors.lastName = 'Last name must be at least 2 characters.';
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    errors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes.';
                }
                break;
                
            case 'middleName':
                if (value && !/^[a-zA-Z\s'-]+$/.test(value)) {
                    errors.middleName = 'Middle name can only contain letters, spaces, hyphens, and apostrophes.';
                }
                break;
                
            case 'zipCode':
                if (!value || value.trim().length === 0) {
                    errors.zipCode = 'Zip code is required.';
                } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    errors.zipCode = 'Please enter a valid zip code (e.g., 12345 or 12345-6789).';
                }
                break;
                
            case 'address':
                if (value && value.length > 255) {
                    errors.address = 'Address cannot exceed 255 characters.';
                }
                break;
                
            case 'city':
                if (value && !/^[a-zA-Z\s'-]+$/.test(value)) {
                    errors.city = 'City can only contain letters, spaces, hyphens, and apostrophes.';
                }
                break;
        }
        
        this.errors = errors;
        return !errors[fieldName];
    }

    validateAllFields() {
        let isValid = true;
        
        // Validate all required fields
        isValid = this.validateField('firstName', this.firstName) && isValid;
        isValid = this.validateField('lastName', this.lastName) && isValid;
        isValid = this.validateField('zipCode', this.zipCode) && isValid;
        
        // Validate optional fields if they have values
        if (this.middleName) {
            isValid = this.validateField('middleName', this.middleName) && isValid;
        }
        if (this.address) {
            isValid = this.validateField('address', this.address) && isValid;
        }
        if (this.city) {
            isValid = this.validateField('city', this.city) && isValid;
        }
        
        return isValid;
    }

    validateForm() {
        const requiredFieldsValid = 
            this.firstName && this.firstName.trim().length > 0 &&
            this.lastName && this.lastName.trim().length > 0 &&
            this.zipCode && this.zipCode.trim().length > 0;
        
        const noErrors = Object.keys(this.errors).length === 0;
        
        this.isFormValid = requiredFieldsValid && noErrors;
        return this.isFormValid;
    }

    // Public API methods for parent components
    @api
    validateComponent() {
        return this.validateAllFields();
    }

    @api
    getFormData() {
        return this.formData;
    }

    @api
    setFormData(data) {
        this.populateFormData(data);
    }

    @api
    resetForm() {
        this.handleReset();
    }

    @api
    focusFirstField() {
        const firstInput = this.template.querySelector('input[data-field="firstName"]');
        if (firstInput) {
            firstInput.focus();
        }
    }

    // Helper methods
    populateFormData(data) {
        if (data) {
            this.firstName = data.firstName || '';
            this.middleName = data.middleName || '';
            this.lastName = data.lastName || '';
            this.address = data.address || '';
            this.city = data.city || '';
            this.state = data.state || '';
            this.zipCode = data.zipCode || '';
        }
    }

    dispatchDataChangeEvent(fieldName, value) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                fieldName: fieldName,
                newValue: value,
                formData: this.formData,
                isValid: this.isFormValid,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    showToast(title, message, variant) {
        const toastEvent = new CustomEvent('showtoast', {
            detail: {
                title: title,
                message: message,
                variant: variant
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(toastEvent);
    }
}
