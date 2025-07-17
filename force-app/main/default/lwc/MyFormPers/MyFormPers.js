import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    // Form data properties
    @track firstName = '';
    @track middleName = '';
    @track lastName = '';
    @track address = '';
    @track city = '';
    @track state = '';
    @track zipCode = '';

    // Validation state
    @track validationErrors = {};

    // Initialize component with initial data if provided
    connectedCallback() {
        if (this.initialData) {
            this.populateFormData(this.initialData);
        }
    }

    // Populate form with initial data
    populateFormData(data) {
        this.firstName = data.firstName || '';
        this.middleName = data.middleName || '';
        this.lastName = data.lastName || '';
        this.address = data.address || '';
        this.city = data.city || '';
        this.state = data.state || '';
        this.zipCode = data.zipCode || '';
    }

    // Event handlers for form fields
    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.validateField('firstName', this.firstName);
        this.notifyParentOfChange('firstName', this.firstName);
    }

    handleMiddleNameChange(event) {
        this.middleName = event.target.value;
        this.notifyParentOfChange('middleName', this.middleName);
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
        this.validateField('lastName', this.lastName);
        this.notifyParentOfChange('lastName', this.lastName);
    }

    handleAddressChange(event) {
        this.address = event.target.value;
        this.notifyParentOfChange('address', this.address);
    }

    handleCityChange(event) {
        this.city = event.target.value;
        this.notifyParentOfChange('city', this.city);
    }

    handleStateChange(event) {
        this.state = event.target.value;
        this.notifyParentOfChange('state', this.state);
    }

    handleZipCodeChange(event) {
        this.zipCode = event.target.value;
        this.validateField('zipCode', this.zipCode);
        this.notifyParentOfChange('zipCode', this.zipCode);
    }

    // Field validation
    validateField(fieldName, value) {
        const errors = { ...this.validationErrors };
        
        switch (fieldName) {
            case 'firstName':
                if (!value || value.trim().length === 0) {
                    errors.firstName = 'First name is required';
                } else {
                    delete errors.firstName;
                }
                break;
            case 'lastName':
                if (!value || value.trim().length === 0) {
                    errors.lastName = 'Last name is required';
                } else {
                    delete errors.lastName;
                }
                break;
            case 'zipCode':
                if (!value || value.trim().length === 0) {
                    errors.zipCode = 'Zip code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(value.trim())) {
                    errors.zipCode = 'Please enter a valid zip code';
                } else {
                    delete errors.zipCode;
                }
                break;
        }
        
        this.validationErrors = errors;
        return Object.keys(errors).length === 0;
    }

    // Form validation
    @api
    validateForm() {
        const isFirstNameValid = this.validateField('firstName', this.firstName);
        const isLastNameValid = this.validateField('lastName', this.lastName);
        const isZipCodeValid = this.validateField('zipCode', this.zipCode);
        
        const isValid = isFirstNameValid && isLastNameValid && isZipCodeValid;
        
        if (!isValid) {
            this.notifyParentOfError({
                message: 'Please correct the validation errors',
                errors: this.validationErrors
            });
        }
        
        return isValid;
    }

    // Get form data
    @api
    getFormData() {
        return {
            firstName: this.firstName,
            middleName: this.middleName,
            lastName: this.lastName,
            address: this.address,
            city: this.city,
            state: this.state,
            zipCode: this.zipCode,
            isValid: this.validateForm()
        };
    }

    // Reset form
    @api
    resetForm() {
        this.firstName = '';
        this.middleName = '';
        this.lastName = '';
        this.address = '';
        this.city = '';
        this.state = '';
        this.zipCode = '';
        this.validationErrors = {};
        
        this.notifyParentOfChange('reset', null);
    }

    // Refresh component data
    @api
    refreshData() {
        if (this.initialData) {
            this.populateFormData(this.initialData);
        }
    }

    // Notify parent of data changes
    notifyParentOfChange(fieldName, newValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                fieldName: fieldName,
                newValue: newValue,
                formData: this.getFormData(),
                isValid: Object.keys(this.validationErrors).length === 0,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    // Notify parent of errors
    notifyParentOfError(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'MyFormPers',
                errorMessage: error.message,
                errors: error.errors,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    // Notify parent of successful operations
    notifyParentOfSuccess(result) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'MyFormPers',
                result: result,
                message: 'Form data updated successfully',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }
}
