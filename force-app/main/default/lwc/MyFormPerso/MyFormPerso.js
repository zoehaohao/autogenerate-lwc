import { LightningElement, api, track } from 'lwc';

export default class MyFormPerso extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api initialPersonalData;
    @api initialAddressData;
    @api isReadOnly = false;

    // Tracked properties for form data
    @track personalInfo = {
        firstName: '',
        middleName: '',
        lastName: ''
    };

    @track addressInfo = {
        address: '',
        city: '',
        state: '',
        zipCode: ''
    };

    @track errors = {};

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
        this.initializeFormData();
    }

    // Initialize form data from parent component
    initializeFormData() {
        if (this.initialPersonalData) {
            this.personalInfo = { ...this.personalInfo, ...this.initialPersonalData };
        }
        if (this.initialAddressData) {
            this.addressInfo = { ...this.addressInfo, ...this.initialAddressData };
        }
    }

    // Handle personal information changes
    handlePersonalInfoChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.personalInfo = {
            ...this.personalInfo,
            [fieldName]: fieldValue
        };

        // Clear field-specific errors
        if (this.errors[fieldName]) {
            this.errors = {
                ...this.errors,
                [fieldName]: null
            };
        }

        // Validate field
        this.validateField(fieldName, fieldValue);

        // Notify parent of data change
        this.dispatchDataChangeEvent();
    }

    // Handle address information changes
    handleAddressInfoChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.addressInfo = {
            ...this.addressInfo,
            [fieldName]: fieldValue
        };

        // Clear field-specific errors
        if (this.errors[fieldName]) {
            this.errors = {
                ...this.errors,
                [fieldName]: null
            };
        }

        // Validate field
        this.validateField(fieldName, fieldValue);

        // Notify parent of data change
        this.dispatchDataChangeEvent();
    }

    // Field validation
    validateField(fieldName, value) {
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'firstName':
                if (!value || value.trim().length === 0) {
                    isValid = false;
                    errorMessage = 'First name is required';
                } else if (value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'First name must be at least 2 characters';
                }
                break;
            
            case 'lastName':
                if (!value || value.trim().length === 0) {
                    isValid = false;
                    errorMessage = 'Last name is required';
                } else if (value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Last name must be at least 2 characters';
                }
                break;
            
            case 'zipCode':
                if (!value || value.trim().length === 0) {
                    isValid = false;
                    errorMessage = 'Zip code is required';
                } else if (!/^[0-9]{5}(-[0-9]{4})?$/.test(value.trim())) {
                    isValid = false;
                    errorMessage = 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
                }
                break;
        }

        if (!isValid) {
            this.errors = {
                ...this.errors,
                [fieldName]: errorMessage
            };
        }

        return isValid;
    }

    // Form validation
    @api
    validateForm() {
        let isFormValid = true;
        const newErrors = {};

        // Validate required fields
        const requiredFields = [
            { name: 'firstName', value: this.personalInfo.firstName, section: 'personal' },
            { name: 'lastName', value: this.personalInfo.lastName, section: 'personal' },
            { name: 'zipCode', value: this.addressInfo.zipCode, section: 'address' }
        ];

        requiredFields.forEach(field => {
            if (!this.validateField(field.name, field.value)) {
                isFormValid = false;
            }
        });

        return {
            isValid: isFormValid,
            personalInfo: this.personalInfo,
            addressInfo: this.addressInfo,
            errors: this.errors
        };
    }

    // Handle form submission
    handleSubmit(event) {
        event.preventDefault();
        
        const validationResult = this.validateForm();
        
        if (validationResult.isValid) {
            // Dispatch success event to parent
            const submitEvent = new CustomEvent('formsubmit', {
                detail: {
                    componentName: 'MyFormPerso',
                    personalInfo: this.personalInfo,
                    addressInfo: this.addressInfo,
                    isValid: true,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(submitEvent);

            // Show success message
            this.showToast('Success', 'Form submitted successfully!', 'success');
        } else {
            // Dispatch error event to parent
            const errorEvent = new CustomEvent('formerror', {
                detail: {
                    componentName: 'MyFormPerso',
                    errors: this.errors,
                    message: 'Please correct the errors before submitting',
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);

            // Show error message
            this.showToast('Error', 'Please correct the errors before submitting', 'error');
        }
    }

    // Handle form reset
    handleReset() {
        this.personalInfo = {
            firstName: '',
            middleName: '',
            lastName: ''
        };
        
        this.addressInfo = {
            address: '',
            city: '',
            state: '',
            zipCode: ''
        };
        
        this.errors = {};

        // Dispatch reset event to parent
        const resetEvent = new CustomEvent('formreset', {
            detail: {
                componentName: 'MyFormPerso',
                message: 'Form has been reset',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(resetEvent);

        this.showToast('Info', 'Form has been reset', 'info');
    }

    // Public API method for parent to get form data
    @api
    getFormData() {
        return {
            personalInfo: this.personalInfo,
            addressInfo: this.addressInfo,
            isValid: this.validateForm().isValid
        };
    }

    // Public API method for parent to set form data
    @api
    setFormData(personalData, addressData) {
        if (personalData) {
            this.personalInfo = { ...this.personalInfo, ...personalData };
        }
        if (addressData) {
            this.addressInfo = { ...this.addressInfo, ...addressData };
        }
    }

    // Public API method for parent to reset form
    @api
    resetForm() {
        this.handleReset();
    }

    // Dispatch data change event to parent
    dispatchDataChangeEvent() {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPerso',
                personalInfo: this.personalInfo,
                addressInfo: this.addressInfo,
                isValid: this.validateForm().isValid,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    // Show toast message
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
