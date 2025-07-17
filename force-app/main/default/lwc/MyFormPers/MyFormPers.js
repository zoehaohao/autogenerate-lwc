import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api initialData;
    @api isReadOnly = false;

    // Form field values
    @track firstName = '';
    @track middleName = '';
    @track lastName = '';
    @track address = '';
    @track city = '';
    @track selectedState = '';
    @track zipCode = '';

    // Error tracking
    @track firstNameError = '';
    @track lastNameError = '';
    @track zipCodeError = '';

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

    // Initialize component with initial data if provided
    connectedCallback() {
        if (this.initialData) {
            this.populateFormData(this.initialData);
        }
    }

    // Handle form field changes
    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.validateFirstName();
        this.notifyParentOfChange('firstName', this.firstName);
    }

    handleMiddleNameChange(event) {
        this.middleName = event.target.value;
        this.notifyParentOfChange('middleName', this.middleName);
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
        this.validateLastName();
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
        this.validateZipCode();
        this.notifyParentOfChange('zipCode', this.zipCode);
    }

    // Validation methods
    validateFirstName() {
        if (!this.firstName || this.firstName.trim().length === 0) {
            this.firstNameError = 'First name is required';
            return false;
        }
        this.firstNameError = '';
        return true;
    }

    validateLastName() {
        if (!this.lastName || this.lastName.trim().length === 0) {
            this.lastNameError = 'Last name is required';
            return false;
        }
        this.lastNameError = '';
        return true;
    }

    validateZipCode() {
        if (!this.zipCode || this.zipCode.trim().length === 0) {
            this.zipCodeError = 'Zip code is required';
            return false;
        }
        // Basic zip code validation (5 digits or 5+4 format)
        const zipPattern = /^\d{5}(-\d{4})?$/;
        if (!zipPattern.test(this.zipCode.trim())) {
            this.zipCodeError = 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
            return false;
        }
        this.zipCodeError = '';
        return true;
    }

    // Public API methods for parent component
    @api
    validateComponent() {
        const isFirstNameValid = this.validateFirstName();
        const isLastNameValid = this.validateLastName();
        const isZipCodeValid = this.validateZipCode();
        
        return isFirstNameValid && isLastNameValid && isZipCodeValid;
    }

    @api
    getFormData() {
        return {
            firstName: this.firstName,
            middleName: this.middleName,
            lastName: this.lastName,
            address: this.address,
            city: this.city,
            state: this.selectedState,
            zipCode: this.zipCode,
            isValid: this.validateComponent()
        };
    }

    @api
    resetForm() {
        this.firstName = '';
        this.middleName = '';
        this.lastName = '';
        this.address = '';
        this.city = '';
        this.selectedState = '';
        this.zipCode = '';
        this.clearErrors();
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

    // Helper methods
    clearErrors() {
        this.firstNameError = '';
        this.lastNameError = '';
        this.zipCodeError = '';
    }

    notifyParentOfChange(fieldName, newValue) {
        // Dispatch custom event to notify parent of data changes
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                fieldName: fieldName,
                newValue: newValue,
                formData: this.getFormData(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    // Handle form submission (if needed by parent)
    handleSubmit(event) {
        event.preventDefault();
        
        if (this.validateComponent()) {
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
                    errorMessage: 'Please complete all required fields',
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);
        }
    }
}
