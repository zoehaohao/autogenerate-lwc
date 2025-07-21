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
    @track state = '';
    @track zipCode = '';

    // Error tracking
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

    // Public API methods for parent component
    @api
    refreshData() {
        this.loadInitialData();
    }

    @api
    validateComponent() {
        return this.validateForm();
    }

    @api
    getFormData() {
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

    // Event handlers
    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.validateField('firstName', this.firstName);
        this.notifyParentOfChange('firstName', this.firstName);
    }

    handleMiddleNameChange(event) {
        this.middleName = event.target.value;
        this.notifyParentOfChange('middleName', this.middleName);
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
        this.validateField('lastName', this.lastName);
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
        this.state = event.target.value;
        this.notifyParentOfChange('state', this.state);
    }

    handleZipCodeChange(event) {
        this.zipCode = event.target.value;
        this.validateField('zipCode', this.zipCode);
        this.notifyParentOfChange('zipCode', this.zipCode);
    }

    handleSave() {
        if (this.validateForm()) {
            const formData = this.getFormData();
            
            // Notify parent of successful save
            const successEvent = new CustomEvent('success', {
                detail: {
                    componentName: 'MyFormPers',
                    result: formData,
                    message: 'Form data saved successfully',
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(successEvent);

            // Show success message
            this.showToast('Success', 'Form saved successfully!', 'success');
        } else {
            // Notify parent of validation errors
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'MyFormPers',
                    errorMessage: 'Please fix validation errors',
                    errors: this.errors,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);

            this.showToast('Error', 'Please fix the validation errors', 'error');
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
        this.errors = {};

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

        this.showToast('Info', 'Form has been reset', 'info');
    }

    // Validation methods
    validateField(fieldName, value) {
        const newErrors = { ...this.errors };

        switch (fieldName) {
            case 'firstName':
                if (!value || value.trim() === '') {
                    newErrors.firstName = 'First Name is required';
                } else {
                    delete newErrors.firstName;
                }
                break;
            case 'lastName':
                if (!value || value.trim() === '') {
                    newErrors.lastName = 'Last Name is required';
                } else {
                    delete newErrors.lastName;
                }
                break;
            case 'zipCode':
                if (!value || value.trim() === '') {
                    newErrors.zipCode = 'Zip Code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(value.trim())) {
                    newErrors.zipCode = 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
                } else {
                    delete newErrors.zipCode;
                }
                break;
        }

        this.errors = newErrors;
        return !newErrors[fieldName];
    }

    validateForm() {
        let isValid = true;
        
        // Validate required fields
        isValid &= this.validateField('firstName', this.firstName);
        isValid &= this.validateField('lastName', this.lastName);
        isValid &= this.validateField('zipCode', this.zipCode);

        return Boolean(isValid);
    }

    // Helper methods
    loadInitialData() {
        if (this.initialData) {
            this.setFormData(this.initialData);
        }
    }

    notifyParentOfChange(fieldName, newValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
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

    showToast(title, message, variant) {
        // For demonstration - in real implementation, you might use lightning/platformShowToastEvent
        console.log(`${variant.toUpperCase()}: ${title} - ${message}`);
    }
}
