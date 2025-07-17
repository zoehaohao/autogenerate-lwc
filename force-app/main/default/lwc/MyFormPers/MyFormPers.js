import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MyFormPers extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api initialData;
    @api isReadOnly = false;
    @api showSubmitButton = true;
    @api showResetButton = true;

    // Form data tracking
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    };

    @track validationErrors = {};

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
            this.formData = { ...this.formData, ...this.initialData };
        }
    }

    // Computed properties for field styling
    get firstNameFieldClass() {
        return this.validationErrors.firstName ? 'slds-has-error' : '';
    }

    get lastNameFieldClass() {
        return this.validationErrors.lastName ? 'slds-has-error' : '';
    }

    get zipCodeFieldClass() {
        return this.validationErrors.zipCode ? 'slds-has-error' : '';
    }

    // Event handlers
    handleInputChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        // Update form data
        this.formData = {
            ...this.formData,
            [fieldName]: fieldValue
        };

        // Clear validation error for this field
        if (this.validationErrors[fieldName]) {
            this.validationErrors = {
                ...this.validationErrors,
                [fieldName]: null
            };
        }

        // Dispatch change event to parent
        this.dispatchDataChangeEvent(fieldName, fieldValue);
    }

    handleSubmit(event) {
        event.preventDefault();
        
        if (this.validateForm()) {
            // Dispatch success event to parent
            const successEvent = new CustomEvent('success', {
                detail: {
                    componentName: 'MyFormPers',
                    formData: this.formData,
                    message: 'Form submitted successfully',
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(successEvent);

            // Show success toast
            this.showToast('Success', 'Form submitted successfully!', 'success');
        } else {
            // Dispatch error event to parent
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'MyFormPers',
                    errorMessage: 'Please fix validation errors',
                    validationErrors: this.validationErrors,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);

            // Show error toast
            this.showToast('Error', 'Please fix the validation errors', 'error');
        }
    }

    handleReset() {
        // Reset form data
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zipCode: ''
        };

        // Clear validation errors
        this.validationErrors = {};

        // Dispatch reset event to parent
        const resetEvent = new CustomEvent('reset', {
            detail: {
                componentName: 'MyFormPers',
                message: 'Form has been reset',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(resetEvent);

        // Show info toast
        this.showToast('Info', 'Form has been reset', 'info');
    }

    // Validation methods
    validateForm() {
        let isValid = true;
        const errors = {};

        // Validate First Name
        if (!this.formData.firstName || this.formData.firstName.trim() === '') {
            errors.firstName = 'First Name is required';
            isValid = false;
        }

        // Validate Last Name
        if (!this.formData.lastName || this.formData.lastName.trim() === '') {
            errors.lastName = 'Last Name is required';
            isValid = false;
        }

        // Validate Zip Code
        if (!this.formData.zipCode || this.formData.zipCode.trim() === '') {
            errors.zipCode = 'Zip Code is required';
            isValid = false;
        } else if (!this.isValidZipCode(this.formData.zipCode)) {
            errors.zipCode = 'Please enter a valid zip code';
            isValid = false;
        }

        this.validationErrors = errors;
        return isValid;
    }

    isValidZipCode(zipCode) {
        // US Zip code validation (5 digits or 5+4 format)
        const zipRegex = /^\d{5}(-\d{4})?$/;
        return zipRegex.test(zipCode.trim());
    }

    // Public API methods for parent components
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
        this.formData = { ...this.formData, ...data };
    }

    @api
    resetForm() {
        this.handleReset();
    }

    @api
    clearValidationErrors() {
        this.validationErrors = {};
    }

    // Helper methods
    dispatchDataChangeEvent(fieldName, fieldValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                fieldName: fieldName,
                newValue: fieldValue,
                formData: this.formData,
                isValid: this.validateForm(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
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
