import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
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

    // Lifecycle hook - initialize component
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

    // Public API methods for parent component interaction
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
    setFormData(data) {
        if (data) {
            this.populateFormData(data);
        }
    }

    @api
    validateForm() {
        const validationResult = {
            isValid: true,
            errors: []
        };

        // Validate required fields
        if (!this.firstName || this.firstName.trim() === '') {
            validationResult.isValid = false;
            validationResult.errors.push('First name is required');
        }

        if (!this.lastName || this.lastName.trim() === '') {
            validationResult.isValid = false;
            validationResult.errors.push('Last name is required');
        }

        if (!this.zipCode || this.zipCode.trim() === '') {
            validationResult.isValid = false;
            validationResult.errors.push('Zip code is required');
        }

        // Validate zip code format (basic US zip code validation)
        if (this.zipCode && !/^\d{5}(-\d{4})?$/.test(this.zipCode.trim())) {
            validationResult.isValid = false;
            validationResult.errors.push('Please enter a valid zip code (e.g., 12345 or 12345-6789)');
        }

        return validationResult;
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
        
        this.dispatchEvent(new CustomEvent('formcleared', {
            detail: {
                componentName: 'MyFormPers',
                timestamp: new Date().toISOString()
            }
        }));
    }

    @api
    refreshData() {
        // Method for parent to refresh component data
        if (this.initialData) {
            this.populateFormData(this.initialData);
        }
    }

    // Helper methods
    populateFormData(data) {
        this.firstName = data.firstName || '';
        this.middleName = data.middleName || '';
        this.lastName = data.lastName || '';
        this.address = data.address || '';
        this.city = data.city || '';
        this.selectedState = data.state || '';
        this.zipCode = data.zipCode || '';
    }

    dispatchDataChangeEvent(fieldName, newValue) {
        // Notify parent component of data changes
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                fieldName: fieldName,
                newValue: newValue,
                formData: this.getFormData(),
                isValid: this.validateForm().isValid,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    // Getter for form validation status
    get isFormValid() {
        return this.validateForm().isValid;
    }

    // Getter for complete form data
    get formData() {
        return this.getFormData();
    }
}
