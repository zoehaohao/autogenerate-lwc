import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api initialData;
    @api isReadOnly = false;
    @api showActions = true;

    // Form data properties
    @track firstName = '';
    @track middleName = '';
    @track lastName = '';
    @track address = '';
    @track city = '';
    @track state = '';
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

    // Lifecycle hooks
    connectedCallback() {
        if (this.initialData) {
            this.loadInitialData();
        }
    }

    // Load initial data if provided by parent
    loadInitialData() {
        if (this.initialData.firstName) this.firstName = this.initialData.firstName;
        if (this.initialData.middleName) this.middleName = this.initialData.middleName;
        if (this.initialData.lastName) this.lastName = this.initialData.lastName;
        if (this.initialData.address) this.address = this.initialData.address;
        if (this.initialData.city) this.city = this.initialData.city;
        if (this.initialData.state) this.state = this.initialData.state;
        if (this.initialData.zipCode) this.zipCode = this.initialData.zipCode;
    }

    // Form validation getter
    get isFormInvalid() {
        return !this.firstName || !this.lastName || !this.zipCode;
    }

    // Get current form data
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

    // Event handlers for form fields
    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.dispatchDataChangeEvent('firstName', event.target.value);
    }

    handleMiddleNameChange(event) {
        this.middleName = event.target.value;
        this.dispatchDataChangeEvent('middleName', event.target.value);
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
        this.dispatchDataChangeEvent('lastName', event.target.value);
    }

    handleAddressChange(event) {
        this.address = event.target.value;
        this.dispatchDataChangeEvent('address', event.target.value);
    }

    handleCityChange(event) {
        this.city = event.target.value;
        this.dispatchDataChangeEvent('city', event.target.value);
    }

    handleStateChange(event) {
        this.state = event.target.value;
        this.dispatchDataChangeEvent('state', event.target.value);
    }

    handleZipCodeChange(event) {
        this.zipCode = event.target.value;
        this.dispatchDataChangeEvent('zipCode', event.target.value);
    }

    // Form action handlers
    handleSave() {
        if (this.validateForm()) {
            const saveEvent = new CustomEvent('save', {
                detail: {
                    componentName: 'MyFormPers',
                    formData: this.formData,
                    isValid: true,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(saveEvent);
        } else {
            this.dispatchErrorEvent('Please fill in all required fields');
        }
    }

    handleReset() {
        this.firstName = '';
        this.middleName = '';
        this.lastName = '';
        this.address = '';
        this.city = '';
        this.state = '';
        this.zipCode = '';

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
    validateForm() {
        const isValid = !this.isFormInvalid;
        return {
            isValid: isValid,
            errors: isValid ? [] : this.getValidationErrors(),
            formData: this.formData
        };
    }

    @api
    resetForm() {
        this.handleReset();
    }

    @api
    getFormData() {
        return this.formData;
    }

    @api
    setFormData(data) {
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

    // Helper methods
    getValidationErrors() {
        const errors = [];
        if (!this.firstName) errors.push('First name is required');
        if (!this.lastName) errors.push('Last name is required');
        if (!this.zipCode) errors.push('Zip code is required');
        return errors;
    }

    dispatchDataChangeEvent(fieldName, newValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                fieldName: fieldName,
                newValue: newValue,
                formData: this.formData,
                isValid: !this.isFormInvalid,
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
                componentName: 'MyFormPers',
                errorMessage: errorMessage,
                formData: this.formData,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }
}
