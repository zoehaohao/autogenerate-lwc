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
    
    connectedCallback() {
        // Initialize with initial data if provided by parent
        if (this.initialData) {
            this.populateFormData(this.initialData);
        }
    }
    
    // Event handlers for form fields
    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.notifyParentOfChange('firstName', this.firstName);
    }
    
    handleMiddleNameChange(event) {
        this.middleName = event.target.value;
        this.notifyParentOfChange('middleName', this.middleName);
    }
    
    handleLastNameChange(event) {
        this.lastName = event.target.value;
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
        this.selectedState = event.target.value;
        this.notifyParentOfChange('state', this.selectedState);
    }
    
    handleZipCodeChange(event) {
        this.zipCode = event.target.value;
        this.notifyParentOfChange('zipCode', this.zipCode);
    }
    
    // Parent-child communication methods
    notifyParentOfChange(fieldName, newValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPerso',
                fieldName: fieldName,
                newValue: newValue,
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
            firstName: this.firstName,
            middleName: this.middleName,
            lastName: this.lastName,
            address: this.address,
            city: this.city,
            state: this.selectedState,
            zipCode: this.zipCode
        };
    }
    
    @api
    populateFormData(data) {
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
                    componentName: 'MyFormPerso',
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
    
    @api
    clearForm() {
        this.firstName = '';
        this.middleName = '';
        this.lastName = '';
        this.address = '';
        this.city = '';
        this.selectedState = '';
        this.zipCode = '';
        
        const clearEvent = new CustomEvent('formcleared', {
            detail: {
                componentName: 'MyFormPerso',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(clearEvent);
    }
    
    @api
    refreshData() {
        // Method for parent to refresh component if needed
        if (this.initialData) {
            this.populateFormData(this.initialData);
        }
    }
}
