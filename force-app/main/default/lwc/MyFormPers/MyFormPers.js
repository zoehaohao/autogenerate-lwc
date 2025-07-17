import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
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
    
    connectedCallback() {
        // Initialize with data from parent if provided
        if (this.initialData) {
            this.loadInitialData();
        }
    }
    
    // Load initial data from parent component
    loadInitialData() {
        if (this.initialData.firstName) this.firstName = this.initialData.firstName;
        if (this.initialData.middleName) this.middleName = this.initialData.middleName;
        if (this.initialData.lastName) this.lastName = this.initialData.lastName;
        if (this.initialData.address) this.address = this.initialData.address;
        if (this.initialData.city) this.city = this.initialData.city;
        if (this.initialData.state) this.selectedState = this.initialData.state;
        if (this.initialData.zipCode) this.zipCode = this.initialData.zipCode;
    }
    
    // Event handlers for form fields
    handleFirstNameChange(event) {
        const oldValue = this.firstName;
        this.firstName = event.target.value;
        this.notifyParentOfChange('firstName', this.firstName, oldValue);
    }
    
    handleMiddleNameChange(event) {
        const oldValue = this.middleName;
        this.middleName = event.target.value;
        this.notifyParentOfChange('middleName', this.middleName, oldValue);
    }
    
    handleLastNameChange(event) {
        const oldValue = this.lastName;
        this.lastName = event.target.value;
        this.notifyParentOfChange('lastName', this.lastName, oldValue);
    }
    
    handleAddressChange(event) {
        const oldValue = this.address;
        this.address = event.target.value;
        this.notifyParentOfChange('address', this.address, oldValue);
    }
    
    handleCityChange(event) {
        const oldValue = this.city;
        this.city = event.target.value;
        this.notifyParentOfChange('city', this.city, oldValue);
    }
    
    handleStateChange(event) {
        const oldValue = this.selectedState;
        this.selectedState = event.target.value;
        this.notifyParentOfChange('state', this.selectedState, oldValue);
    }
    
    handleZipCodeChange(event) {
        const oldValue = this.zipCode;
        this.zipCode = event.target.value;
        this.notifyParentOfChange('zipCode', this.zipCode, oldValue);
    }
    
    // Notify parent component of data changes
    notifyParentOfChange(fieldName, newValue, oldValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                fieldName: fieldName,
                newValue: newValue,
                oldValue: oldValue,
                formData: this.getFormData(),
                isValid: this.validateForm(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }
    
    // Public API method for parent to get form data
    @api
    getFormData() {
        return {
            firstName: this.firstName,
            middleName: this.middleName,
            lastName: this.lastName,
            address: this.address,
            city: this.city,
            state: this.selectedState,
            zipCode: this.zipCode
        };
    }
    
    // Public API method for parent to validate form
    @api
    validateForm() {
        const requiredFields = [
            { name: 'firstName', value: this.firstName },
            { name: 'lastName', value: this.lastName },
            { name: 'zipCode', value: this.zipCode }
        ];
        
        const validationResults = requiredFields.map(field => ({
            fieldName: field.name,
            isValid: field.value && field.value.trim().length > 0,
            errorMessage: field.value && field.value.trim().length > 0 ? '' : `${field.name} is required`
        }));
        
        const isFormValid = validationResults.every(result => result.isValid);
        
        if (!isFormValid) {
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'MyFormPers',
                    errorMessage: 'Please fill in all required fields',
                    validationResults: validationResults,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);
        }
        
        return isFormValid;
    }
    
    // Public API method for parent to reset form
    @api
    resetForm() {
        this.firstName = '';
        this.middleName = '';
        this.lastName = '';
        this.address = '';
        this.city = '';
        this.selectedState = '';
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
    
    // Public API method for parent to set form data
    @api
    setFormData(data) {
        if (data) {
            this.firstName = data.firstName || '';
            this.middleName = data.middleName || '';
            this.lastName = data.lastName || '';
            this.address = data.address || '';
            this.city = data.city || '';
            this.selectedState = data.state || '';
            this.zipCode = data.zipCode || '';
        }
    }
}
