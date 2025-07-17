import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

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

    // Component lifecycle
    connectedCallback() {
        this.initializeFormData();
    }

    // Initialize form data from parent component
    initializeFormData() {
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

        // Notify parent component of data changes
        this.dispatchDataChangeEvent('personal', fieldName, fieldValue);
    }

    // Handle address information changes
    handleAddressInfoChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.addressInfo = {
            ...this.addressInfo,
            [fieldName]: fieldValue
        };

        // Notify parent component of data changes
        this.dispatchDataChangeEvent('address', fieldName, fieldValue);
    }

    // Dispatch data change event to parent
    dispatchDataChangeEvent(section, fieldName, fieldValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'MyFormPers',
                section: section,
                fieldName: fieldName,
                fieldValue: fieldValue,
                personalInfo: this.personalInfo,
                addressInfo: this.addressInfo,
                isValid: this.validateForm(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    // Handle form submission
    handleSubmit() {
        if (this.validateForm()) {
            const formData = {
                personalInfo: this.personalInfo,
                addressInfo: this.addressInfo
            };

            // Dispatch success event to parent
            const successEvent = new CustomEvent('success', {
                detail: {
                    componentName: 'MyFormPers',
                    formData: formData,
                    message: 'Form submitted successfully',
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(successEvent);

            // Show success toast
            this.showToast('Success', 'Form submitted successfully!', 'success');
        } else {
            // Show validation error
            this.showToast('Error', 'Please fill in all required fields.', 'error');
            
            // Dispatch error event to parent
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'MyFormPers',
                    errorMessage: 'Validation failed - required fields missing',
                    errorCode: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);
        }
    }

    // Handle form clearing
    handleClearForm() {
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

        // Notify parent of form clear
        const clearEvent = new CustomEvent('formclear', {
            detail: {
                componentName: 'MyFormPers',
                message: 'Form cleared',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(clearEvent);

        this.showToast('Info', 'Form cleared successfully!', 'info');
    }

    // Public API method for form validation
    @api
    validateComponent() {
        return this.validateForm();
    }

    // Public API method to get form data
    @api
    getFormData() {
        return {
            personalInfo: this.personalInfo,
            addressInfo: this.addressInfo,
            isValid: this.validateForm()
        };
    }

    // Public API method to set form data
    @api
    setFormData(personalData, addressData) {
        if (personalData) {
            this.personalInfo = { ...this.personalInfo, ...personalData };
        }
        if (addressData) {
            this.addressInfo = { ...this.addressInfo, ...addressData };
        }
    }

    // Public API method to refresh component
    @api
    refreshData() {
        this.initializeFormData();
    }

    // Form validation logic
    validateForm() {
        const requiredPersonalFields = ['firstName', 'lastName'];
        const requiredAddressFields = ['zipCode'];

        // Validate personal info required fields
        const personalValid = requiredPersonalFields.every(field => 
            this.personalInfo[field] && this.personalInfo[field].trim() !== ''
        );

        // Validate address info required fields
        const addressValid = requiredAddressFields.every(field => 
            this.addressInfo[field] && this.addressInfo[field].trim() !== ''
        );

        return personalValid && addressValid;
    }

    // Validate individual field
    validateField(fieldName, value, section = 'personal') {
        const requiredFields = {
            personal: ['firstName', 'lastName'],
            address: ['zipCode']
        };

        const sectionRequiredFields = requiredFields[section] || [];
        
        if (sectionRequiredFields.includes(fieldName)) {
            return value && value.trim() !== '';
        }
        
        return true; // Optional fields are always valid
    }

    // Show toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Getter for form validity status
    get isFormValid() {
        return this.validateForm();
    }

    // Getter for personal info completion status
    get personalInfoComplete() {
        return this.personalInfo.firstName && this.personalInfo.lastName;
    }

    // Getter for address info completion status
    get addressInfoComplete() {
        return this.addressInfo.zipCode;
    }
}
