import { LightningElement, api, track } from 'lwc';

export default class MyFormPerso extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api initialData;
    @api isReadOnly = false;
    @api showActionButtons = true;

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
        if (this.initialData) {
            this.loadInitialData();
        }
    }

    // Load initial data if provided by parent
    loadInitialData() {
        try {
            if (this.initialData.personalInfo) {
                this.personalInfo = { ...this.personalInfo, ...this.initialData.personalInfo };
            }
            if (this.initialData.addressInfo) {
                this.addressInfo = { ...this.addressInfo, ...this.initialData.addressInfo };
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Event handlers
    handlePersonalInfoChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.personalInfo = {
            ...this.personalInfo,
            [field]: value
        };

        // Clear error for this field
        if (this.errors[field]) {
            this.errors = {
                ...this.errors,
                [field]: null
            };
        }

        // Notify parent of data change
        this.dispatchDataChangeEvent();
    }

    handleAddressInfoChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.addressInfo = {
            ...this.addressInfo,
            [field]: value
        };

        // Clear error for this field
        if (this.errors[field]) {
            this.errors = {
                ...this.errors,
                [field]: null
            };
        }

        // Notify parent of data change
        this.dispatchDataChangeEvent();
    }

    handleStateChange(event) {
        this.addressInfo = {
            ...this.addressInfo,
            state: event.detail.value
        };

        // Notify parent of data change
        this.dispatchDataChangeEvent();
    }

    handleClearForm() {
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

        // Notify parent of form clear
        const clearEvent = new CustomEvent('formclear', {
            detail: {
                componentName: 'MyFormPerso',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(clearEvent);
    }

    handleSubmit() {
        if (this.validateForm()) {
            const formData = {
                personalInfo: this.personalInfo,
                addressInfo: this.addressInfo
            };

            // Dispatch success event to parent
            const successEvent = new CustomEvent('formsubmit', {
                detail: {
                    componentName: 'MyFormPerso',
                    formData: formData,
                    isValid: true,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(successEvent);
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
        }
    }

    // Validation methods
    validateForm() {
        let isValid = true;
        const newErrors = {};

        // Validate required fields
        if (!this.personalInfo.firstName || this.personalInfo.firstName.trim() === '') {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        if (!this.personalInfo.lastName || this.personalInfo.lastName.trim() === '') {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        if (!this.addressInfo.zipCode || this.addressInfo.zipCode.trim() === '') {
            newErrors.zipCode = 'Zip code is required';
            isValid = false;
        } else if (!this.validateZipCode(this.addressInfo.zipCode)) {
            newErrors.zipCode = 'Please enter a valid zip code';
            isValid = false;
        }

        this.errors = newErrors;
        return isValid;
    }

    validateZipCode(zipCode) {
        // US zip code validation (5 digits or 5+4 format)
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
        return {
            personalInfo: this.personalInfo,
            addressInfo: this.addressInfo,
            isValid: this.validateForm()
        };
    }

    @api
    clearForm() {
        this.handleClearForm();
    }

    @api
    setFormData(data) {
        if (data.personalInfo) {
            this.personalInfo = { ...this.personalInfo, ...data.personalInfo };
        }
        if (data.addressInfo) {
            this.addressInfo = { ...this.addressInfo, ...data.addressInfo };
        }
    }

    // Utility methods
    dispatchDataChangeEvent() {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPerso',
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

    // Getters for dynamic styling
    get submitButtonVariant() {
        return this.isFormValid ? 'brand' : 'neutral';
    }

    get isSubmitDisabled() {
        return this.isReadOnly || !this.isFormValid;
    }

    get isFormValid() {
        return this.personalInfo.firstName && 
               this.personalInfo.lastName && 
               this.addressInfo.zipCode &&
               this.validateZipCode(this.addressInfo.zipCode);
    }
}
