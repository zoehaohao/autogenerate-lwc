import { LightningElement, api, track } from 'lwc';

export default class MyFormPerso extends LightningElement {
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
    @track selectedState = '';
    @track zipCode = '';

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

    // Lifecycle hook to initialize data
    connectedCallback() {
        if (this.initialData) {
            this.populateFormData(this.initialData);
        }
    }

    // Event handlers for form fields
    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.dispatchDataChangeEvent('firstName', this.firstName);
    }

    handleMiddleNameChange(event) {
        this.middleName = event.target.value;
        this.dispatchDataChangeEvent('middleName', this.middleName);
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
        this.dispatchDataChangeEvent('lastName', this.lastName);
    }

    handleAddressChange(event) {
        this.address = event.target.value;
        this.dispatchDataChangeEvent('address', this.address);
    }

    handleCityChange(event) {
        this.city = event.target.value;
        this.dispatchDataChangeEvent('city', this.city);
    }

    handleStateChange(event) {
        this.selectedState = event.target.value;
        this.dispatchDataChangeEvent('state', this.selectedState);
    }

    handleZipCodeChange(event) {
        this.zipCode = event.target.value;
        this.dispatchDataChangeEvent('zipCode', this.zipCode);
    }

    // Validation methods
    validateField(fieldName, value) {
        const requiredFields = ['firstName', 'lastName', 'zipCode'];
        
        if (requiredFields.includes(fieldName)) {
            return value && value.trim().length > 0;
        }
        
        // Additional validation for zip code format
        if (fieldName === 'zipCode' && value) {
            const zipRegex = /^\d{5}(-\d{4})?$/;
            return zipRegex.test(value);
        }
        
        return true;
    }

    @api
    validateComponent() {
        const fields = [
            { name: 'firstName', value: this.firstName },
            { name: 'lastName', value: this.lastName },
            { name: 'zipCode', value: this.zipCode }
        ];

        const validationResults = fields.map(field => ({
            fieldName: field.name,
            isValid: this.validateField(field.name, field.value),
            value: field.value
        }));

        const isFormValid = validationResults.every(result => result.isValid);
        
        if (!isFormValid) {
            const invalidFields = validationResults
                .filter(result => !result.isValid)
                .map(result => result.fieldName);
            
            this.dispatchErrorEvent(`Please fill in required fields: ${invalidFields.join(', ')}`);
        }

        return {
            isValid: isFormValid,
            validationResults: validationResults,
            formData: this.getFormData()
        };
    }

    @api
    getFormData() {
        return {
            personalInformation: {
                firstName: this.firstName,
                middleName: this.middleName,
                lastName: this.lastName
            },
            address: {
                address: this.address,
                city: this.city,
                state: this.selectedState,
                zipCode: this.zipCode
            }
        };
    }

    @api
    populateFormData(data) {
        if (data.personalInformation) {
            this.firstName = data.personalInformation.firstName || '';
            this.middleName = data.personalInformation.middleName || '';
            this.lastName = data.personalInformation.lastName || '';
        }
        
        if (data.address) {
            this.address = data.address.address || '';
            this.city = data.address.city || '';
            this.selectedState = data.address.state || '';
            this.zipCode = data.address.zipCode || '';
        }
    }

    @api
    clearForm() {
        this.firstName = '';
        this.middleName = '';
        this.lastName = '';
        this.address = '';
        this.city = '';
        this.selectedState = '';
        this.zipCode = '';
        
        this.dispatchSuccessEvent('Form cleared successfully');
    }

    @api
    refreshData() {
        if (this.initialData) {
            this.populateFormData(this.initialData);
        }
    }

    // Parent-child communication methods
    dispatchDataChangeEvent(fieldName, newValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPerso',
                fieldName: fieldName,
                newValue: newValue,
                formData: this.getFormData(),
                isValid: this.validateField(fieldName, newValue),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'MyFormPerso',
                errorMessage: errorMessage,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchSuccessEvent(message) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'MyFormPerso',
                message: message,
                formData: this.getFormData(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }
}
