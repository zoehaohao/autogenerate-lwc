import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api initialPersonalData;
    @api initialAddressData;
    @api isReadOnly = false;

    // Form data tracking
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

    // Component lifecycle
    connectedCallback() {
        this.initializeFormData();
    }

    // Initialize form data from parent or defaults
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

        // Notify parent of data changes
        this.dispatchDataChangeEvent('personal', fieldName, fieldValue);
    }

    // Handle address information changes
    handleAddressInfoChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.addressInfo = {
            ...this.addressInfo,
            [fieldName]: fieldValue
        };

        // Notify parent of data changes
        this.dispatchDataChangeEvent('address', fieldName, fieldValue);
    }

    // Dispatch data change events to parent
    dispatchDataChangeEvent(section, fieldName, fieldValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                section: section,
                fieldName: fieldName,
                fieldValue: fieldValue,
                personalInfo: this.personalInfo,
                addressInfo: this.addressInfo,
                isValid: this.validateForm(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    // Form validation
    validateForm() {
        const requiredFields = [
            { value: this.personalInfo.firstName, name: 'First name' },
            { value: this.personalInfo.lastName, name: 'Last name' },
            { value: this.addressInfo.zipCode, name: 'Zip code' }
        ];

        const missingFields = requiredFields.filter(field => !field.value || field.value.trim() === '');
        return missingFields.length === 0;
    }

    // Get validation errors
    getValidationErrors() {
        const errors = [];
        
        if (!this.personalInfo.firstName || this.personalInfo.firstName.trim() === '') {
            errors.push('First name is required');
        }
        
        if (!this.personalInfo.lastName || this.personalInfo.lastName.trim() === '') {
            errors.push('Last name is required');
        }
        
        if (!this.addressInfo.zipCode || this.addressInfo.zipCode.trim() === '') {
            errors.push('Zip code is required');
        }

        // Validate zip code format (basic US zip code validation)
        if (this.addressInfo.zipCode && !/^\d{5}(-\d{4})?$/.test(this.addressInfo.zipCode)) {
            errors.push('Please enter a valid zip code (e.g., 12345 or 12345-6789)');
        }

        return errors;
    }

    // Handle form submission
    handleSubmit() {
        const validationErrors = this.getValidationErrors();
        
        if (validationErrors.length > 0) {
            // Dispatch error event to parent
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'MyFormPers',
                    errorMessage: 'Please correct the following errors:',
                    errors: validationErrors,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);
            return;
        }

        // Dispatch success event to parent
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'MyFormPers',
                message: 'Form submitted successfully',
                formData: {
                    personalInfo: this.personalInfo,
                    addressInfo: this.addressInfo
                },
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
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

        // Reset form inputs
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
        inputs.forEach(input => {
            input.value = '';
        });

        // Notify parent of reset
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
    }

    // Public API methods for parent component
    @api
    validateComponent() {
        return this.validateForm();
    }

    @api
    getFormData() {
        return {
            personalInfo: this.personalInfo,
            addressInfo: this.addressInfo,
            isValid: this.validateForm(),
            errors: this.getValidationErrors()
        };
    }

    @api
    setFormData(personalData, addressData) {
        if (personalData) {
            this.personalInfo = { ...this.personalInfo, ...personalData };
        }
        if (addressData) {
            this.addressInfo = { ...this.addressInfo, ...addressData };
        }
    }

    @api
    resetForm() {
        this.handleReset();
    }

    @api
    submitForm() {
        this.handleSubmit();
    }
}
