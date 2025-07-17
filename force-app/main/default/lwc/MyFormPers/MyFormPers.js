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

    // State options for dropdown
    get stateOptions() {
        return [
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
    }

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

        // Notify parent of data changes
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

        // Notify parent of data changes
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

            // Show success message
            this.showToast('Success', 'Form submitted successfully!', 'success');
        } else {
            // Dispatch error event to parent
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'MyFormPers',
                    errorMessage: 'Please fill in all required fields',
                    validationErrors: this.getValidationErrors(),
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);

            // Show error message
            this.showToast('Error', 'Please fill in all required fields', 'error');
        }
    }

    // Handle form reset
    handleReset() {
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

        // Reset form fields
        const inputFields = this.template.querySelectorAll('lightning-input, lightning-combobox');
        inputFields.forEach(field => {
            field.value = '';
        });

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

    // Validate form
    validateForm() {
        const requiredFields = [
            { value: this.personalInfo.firstName, name: 'First Name' },
            { value: this.personalInfo.lastName, name: 'Last Name' },
            { value: this.addressInfo.zipCode, name: 'Zip Code' }
        ];

        return requiredFields.every(field => field.value && field.value.trim() !== '');
    }

    // Get validation errors
    getValidationErrors() {
        const errors = [];
        if (!this.personalInfo.firstName || this.personalInfo.firstName.trim() === '') {
            errors.push('First Name is required');
        }
        if (!this.personalInfo.lastName || this.personalInfo.lastName.trim() === '') {
            errors.push('Last Name is required');
        }
        if (!this.addressInfo.zipCode || this.addressInfo.zipCode.trim() === '') {
            errors.push('Zip Code is required');
        }
        return errors;
    }

    // Public API methods for parent component
    @api
    getFormData() {
        return {
            personalInfo: this.personalInfo,
            addressInfo: this.addressInfo,
            isValid: this.validateForm()
        };
    }

    @api
    validateComponent() {
        return this.validateForm();
    }

    @api
    resetForm() {
        this.handleReset();
    }

    @api
    setFormData(personalData, addressData) {
        if (personalData) {
            this.personalInfo = { ...this.personalInfo, ...personalData };
        }
        if (addressData) {
            this.addressInfo = { ...this.addressInfo, ...addressData };
        }
    }

    // Show toast message
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
