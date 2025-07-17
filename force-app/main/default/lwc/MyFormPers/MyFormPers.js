import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api configSettings;
    @api initialData;
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
        // Initialize with initial data if provided by parent
        if (this.initialData) {
            this.initializeFormData();
        }
    }

    // Initialize form data from parent
    initializeFormData() {
        if (this.initialData.personalInfo) {
            this.personalInfo = { ...this.personalInfo, ...this.initialData.personalInfo };
        }
        if (this.initialData.addressInfo) {
            this.addressInfo = { ...this.addressInfo, ...this.initialData.addressInfo };
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
        this.dispatchDataChangeEvent('personalInfo', fieldName, fieldValue);
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
        this.dispatchDataChangeEvent('addressInfo', fieldName, fieldValue);
    }

    // Dispatch custom events to parent
    dispatchDataChangeEvent(section, fieldName, fieldValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                section: section,
                fieldName: fieldName,
                newValue: fieldValue,
                formData: this.getFormData(),
                isValid: this.validateForm(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    // Public API methods for parent component
    @api
    getFormData() {
        return {
            personalInfo: { ...this.personalInfo },
            addressInfo: { ...this.addressInfo }
        };
    }

    @api
    validateForm() {
        const validationResults = {
            isValid: true,
            errors: []
        };

        // Validate required fields
        if (!this.personalInfo.firstName || this.personalInfo.firstName.trim() === '') {
            validationResults.isValid = false;
            validationResults.errors.push('First name is required');
        }

        if (!this.personalInfo.lastName || this.personalInfo.lastName.trim() === '') {
            validationResults.isValid = false;
            validationResults.errors.push('Last name is required');
        }

        if (!this.addressInfo.zipCode || this.addressInfo.zipCode.trim() === '') {
            validationResults.isValid = false;
            validationResults.errors.push('Zip code is required');
        }

        // Validate zip code format (basic US zip code validation)
        if (this.addressInfo.zipCode && !this.isValidZipCode(this.addressInfo.zipCode)) {
            validationResults.isValid = false;
            validationResults.errors.push('Please enter a valid zip code');
        }

        return validationResults;
    }

    @api
    clearForm() {
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

        // Notify parent of form clear
        const clearEvent = new CustomEvent('formclear', {
            detail: {
                componentName: 'MyFormPers',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(clearEvent);
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
    isValidZipCode(zipCode) {
        // US zip code validation (5 digits or 5+4 format)
        const zipRegex = /^\d{5}(-\d{4})?$/;
        return zipRegex.test(zipCode.trim());
    }

    // Handle form submission (if needed by parent)
    handleSubmit() {
        const validation = this.validateForm();
        
        if (validation.isValid) {
            const submitEvent = new CustomEvent('formsubmit', {
                detail: {
                    componentName: 'MyFormPers',
                    formData: this.getFormData(),
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(submitEvent);
        } else {
            const errorEvent = new CustomEvent('formerror', {
                detail: {
                    componentName: 'MyFormPers',
                    errors: validation.errors,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);
        }
    }
}
