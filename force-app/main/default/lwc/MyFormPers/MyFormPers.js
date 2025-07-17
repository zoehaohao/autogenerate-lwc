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

    // Lifecycle hook - initialize component
    connectedCallback() {
        if (this.initialData) {
            this.loadInitialData();
        }
    }

    // Load initial data from parent component
    loadInitialData() {
        if (this.initialData.personalInfo) {
            this.personalInfo = { ...this.personalInfo, ...this.initialData.personalInfo };
        }
        if (this.initialData.addressInfo) {
            this.addressInfo = { ...this.addressInfo, ...this.initialData.addressInfo };
        }
    }

    // Handle personal information field changes
    handlePersonalInfoChange(event) {
        const fieldName = event.target.dataset.field;
        const fieldValue = event.target.value;
        const oldValue = this.personalInfo[fieldName];

        this.personalInfo = {
            ...this.personalInfo,
            [fieldName]: fieldValue
        };

        // Dispatch change event to parent
        this.dispatchDataChangeEvent('personalInfo', fieldName, fieldValue, oldValue);
    }

    // Handle address information field changes
    handleAddressChange(event) {
        const fieldName = event.target.dataset.field;
        const fieldValue = event.target.value;
        const oldValue = this.addressInfo[fieldName];

        this.addressInfo = {
            ...this.addressInfo,
            [fieldName]: fieldValue
        };

        // Dispatch change event to parent
        this.dispatchDataChangeEvent('addressInfo', fieldName, fieldValue, oldValue);
    }

    // Handle state dropdown change
    handleStateChange(event) {
        const fieldValue = event.detail.value;
        const oldValue = this.addressInfo.state;

        this.addressInfo = {
            ...this.addressInfo,
            state: fieldValue
        };

        // Dispatch change event to parent
        this.dispatchDataChangeEvent('addressInfo', 'state', fieldValue, oldValue);
    }

    // Dispatch data change event to parent component
    dispatchDataChangeEvent(section, fieldName, newValue, oldValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                section: section,
                fieldName: fieldName,
                newValue: newValue,
                oldValue: oldValue,
                allData: this.getAllFormData(),
                isValid: this.validateComponent(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    // Get all form data
    getAllFormData() {
        return {
            personalInfo: { ...this.personalInfo },
            addressInfo: { ...this.addressInfo }
        };
    }

    // Public API method for parent to validate component
    @api
    validateComponent() {
        const requiredFields = [
            { section: 'personalInfo', field: 'firstName', label: 'First name' },
            { section: 'personalInfo', field: 'lastName', label: 'Last name' },
            { section: 'addressInfo', field: 'zipCode', label: 'Zip code' }
        ];

        const validationErrors = [];

        requiredFields.forEach(fieldInfo => {
            const value = this[fieldInfo.section][fieldInfo.field];
            if (!value || value.trim() === '') {
                validationErrors.push(`${fieldInfo.label} is required`);
            }
        });

        const isValid = validationErrors.length === 0;

        if (!isValid) {
            this.dispatchErrorEvent(validationErrors);
        }

        return isValid;
    }

    // Public API method for parent to get form data
    @api
    getFormData() {
        return this.getAllFormData();
    }

    // Public API method for parent to set form data
    @api
    setFormData(data) {
        if (data.personalInfo) {
            this.personalInfo = { ...this.personalInfo, ...data.personalInfo };
        }
        if (data.addressInfo) {
            this.addressInfo = { ...this.addressInfo, ...data.addressInfo };
        }
    }

    // Public API method for parent to clear form
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

        // Dispatch clear event to parent
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

    // Public API method for parent to refresh component
    @api
    refreshData() {
        if (this.initialData) {
            this.loadInitialData();
        }
    }

    // Dispatch error event to parent
    dispatchErrorEvent(errors) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'MyFormPers',
                errors: errors,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    // Dispatch success event to parent
    dispatchSuccessEvent(message) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'MyFormPers',
                message: message,
                data: this.getAllFormData(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }
}
