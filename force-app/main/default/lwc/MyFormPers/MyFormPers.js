import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api initialPersonalData;
    @api initialAddressData;
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
    
    // Lifecycle hooks
    connectedCallback() {
        this.initializeData();
    }
    
    // Initialize form data from parent component
    initializeData() {
        if (this.initialPersonalData) {
            this.personalInfo = { ...this.personalInfo, ...this.initialPersonalData };
        }
        if (this.initialAddressData) {
            this.addressInfo = { ...this.addressInfo, ...this.initialAddressData };
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
        
        // Notify parent of data change
        this.dispatchDataChangeEvent();
    }
    
    // Handle address information changes
    handleAddressInfoChange(event) {
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
        
        // Validate field if required
        if (fieldName === 'zipCode') {
            this.validateField(fieldName, fieldValue);
        }
        
        // Notify parent of data change
        this.dispatchDataChangeEvent();
    }
    
    // Field validation
    validateField(fieldName, value) {
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'firstName':
                if (!value || value.trim().length === 0) {
                    isValid = false;
                    errorMessage = 'First Name is required';
                }
                break;
            case 'lastName':
                if (!value || value.trim().length === 0) {
                    isValid = false;
                    errorMessage = 'Last Name is required';
                }
                break;
            case 'zipCode':
                if (!value || value.trim().length === 0) {
                    isValid = false;
                    errorMessage = 'Zip Code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(value.trim())) {
                    isValid = false;
                    errorMessage = 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
                }
                break;
        }
        
        if (!isValid) {
            this.errors = {
                ...this.errors,
                [fieldName]: errorMessage
            };
        }
        
        return isValid;
    }
    
    // Validate entire form
    @api
    validateForm() {
        let isFormValid = true;
        const newErrors = {};
        
        // Validate required fields
        const requiredFields = [
            { name: 'firstName', value: this.personalInfo.firstName, label: 'First Name' },
            { name: 'lastName', value: this.personalInfo.lastName, label: 'Last Name' },
            { name: 'zipCode', value: this.addressInfo.zipCode, label: 'Zip Code' }
        ];
        
        requiredFields.forEach(field => {
            if (!this.validateField(field.name, field.value)) {
                isFormValid = false;
            }
        });
        
        return {
            isValid: isFormValid,
            errors: this.errors,
            data: this.getFormData()
        };
    }
    
    // Get complete form data
    @api
    getFormData() {
        return {
            personalInfo: { ...this.personalInfo },
            addressInfo: { ...this.addressInfo },
            isValid: this.validateForm().isValid
        };
    }
    
    // Reset form data
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
        
        // Notify parent of reset
        this.dispatchResetEvent();
    }
    
    // Handle save button click
    handleSave(event) {
        const validationResult = this.validateForm();
        
        if (validationResult.isValid) {
            // Dispatch success event to parent
            const saveEvent = new CustomEvent('save', {
                detail: {
                    componentName: 'MyFormPers',
                    formData: this.getFormData(),
                    message: 'Form data is valid and ready to save',
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(saveEvent);
        } else {
            // Dispatch error event to parent
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'MyFormPers',
                    errorMessage: 'Please correct the errors in the form',
                    errors: this.errors,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);
        }
    }
    
    // Handle reset button click
    handleReset(event) {
        this.resetForm();
    }
    
    // Dispatch data change event to parent
    dispatchDataChangeEvent() {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                personalInfo: { ...this.personalInfo },
                addressInfo: { ...this.addressInfo },
                isValid: this.validateForm().isValid,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }
    
    // Dispatch reset event to parent
    dispatchResetEvent() {
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
}
