import { LightningElement, api, track } from 'lwc';

export default class MyFormPersonal extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
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
    
    // Lifecycle hook
    connectedCallback() {
        if (this.initialData) {
            this.loadInitialData();
        }
    }
    
    // Load initial data from parent
    loadInitialData() {
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
        
        // Clear error for this field
        if (this.errors[fieldName]) {
            this.errors = {
                ...this.errors,
                [fieldName]: null
            };
        }
        
        // Validate field
        this.validateField(fieldName, fieldValue);
        
        // Dispatch change event to parent
        this.dispatchDataChangeEvent('personalInfo', fieldName, fieldValue);
    }
    
    // Handle address information changes
    handleAddressChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.addressInfo = {
            ...this.addressInfo,
            [fieldName]: fieldValue
        };
        
        // Clear error for this field
        if (this.errors[fieldName]) {
            this.errors = {
                ...this.errors,
                [fieldName]: null
            };
        }
        
        // Validate field
        this.validateField(fieldName, fieldValue);
        
        // Dispatch change event to parent
        this.dispatchDataChangeEvent('addressInfo', fieldName, fieldValue);
    }
    
    // Field validation
    validateField(fieldName, value) {
        let errorMessage = null;
        
        switch (fieldName) {
            case 'firstName':
                if (!value || value.trim().length === 0) {
                    errorMessage = 'First name is required';
                } else if (value.trim().length < 2) {
                    errorMessage = 'First name must be at least 2 characters';
                }
                break;
                
            case 'lastName':
                if (!value || value.trim().length === 0) {
                    errorMessage = 'Last name is required';
                } else if (value.trim().length < 2) {
                    errorMessage = 'Last name must be at least 2 characters';
                }
                break;
                
            case 'zipCode':
                if (!value || value.trim().length === 0) {
                    errorMessage = 'Zip code is required';
                } else if (!/^[0-9]{5}(-[0-9]{4})?$/.test(value.trim())) {
                    errorMessage = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
                }
                break;
        }
        
        if (errorMessage) {
            this.errors = {
                ...this.errors,
                [fieldName]: errorMessage
            };
        }
        
        return !errorMessage;
    }
    
    // Validate entire form
    @api
    validateForm() {
        let isValid = true;
        const newErrors = {};
        
        // Validate required personal info fields
        if (!this.personalInfo.firstName || this.personalInfo.firstName.trim().length === 0) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        } else if (this.personalInfo.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
            isValid = false;
        }
        
        if (!this.personalInfo.lastName || this.personalInfo.lastName.trim().length === 0) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        } else if (this.personalInfo.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
            isValid = false;
        }
        
        // Validate required address fields
        if (!this.addressInfo.zipCode || this.addressInfo.zipCode.trim().length === 0) {
            newErrors.zipCode = 'Zip code is required';
            isValid = false;
        } else if (!/^[0-9]{5}(-[0-9]{4})?$/.test(this.addressInfo.zipCode.trim())) {
            newErrors.zipCode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
            isValid = false;
        }
        
        this.errors = newErrors;
        return isValid;
    }
    
    // Get form data
    @api
    getFormData() {
        return {
            personalInfo: { ...this.personalInfo },
            addressInfo: { ...this.addressInfo },
            isValid: this.validateForm()
        };
    }
    
    // Reset form
    @api
    resetForm() {
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
        
        // Dispatch reset event to parent
        const resetEvent = new CustomEvent('formreset', {
            detail: {
                componentName: 'MyFormPersonal',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(resetEvent);
    }
    
    // Set form data from parent
    @api
    setFormData(data) {
        if (data.personalInfo) {
            this.personalInfo = { ...this.personalInfo, ...data.personalInfo };
        }
        if (data.addressInfo) {
            this.addressInfo = { ...this.addressInfo, ...data.addressInfo };
        }
    }
    
    // Dispatch data change event to parent
    dispatchDataChangeEvent(section, fieldName, fieldValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPersonal',
                section: section,
                fieldName: fieldName,
                fieldValue: fieldValue,
                formData: {
                    personalInfo: { ...this.personalInfo },
                    addressInfo: { ...this.addressInfo }
                },
                isValid: this.hasNoErrors(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }
    
    // Check if form has no errors
    hasNoErrors() {
        return Object.keys(this.errors).every(key => !this.errors[key]);
    }
    
    // Get current validation state
    @api
    getValidationState() {
        return {
            isValid: this.validateForm(),
            errors: { ...this.errors },
            hasErrors: !this.hasNoErrors()
        };
    }
}
