import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track firstName = '';
    @track middleName = '';
    @track lastName = '';
    @track birthdate = '';
    @track address = '';
    @track city = '';
    @track state = '';
    @track zipCode = '';
    @track startDate = '';
    @track endDate = '';
    @track isLoading = false;

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

    get isSubmitDisabled() {
        return !this.firstName || !this.lastName || !this.birthdate || 
               !this.zipCode || !this.startDate || !this.endDate || this.isLoading;
    }

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
    }

    handleMiddleNameChange(event) {
        this.middleName = event.target.value;
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
    }

    handleBirthdateChange(event) {
        this.birthdate = event.target.value;
        this.validateBirthdate();
    }

    handleAddressChange(event) {
        this.address = event.target.value;
    }

    handleCityChange(event) {
        this.city = event.target.value;
    }

    handleStateChange(event) {
        this.state = event.target.value;
    }

    handleZipCodeChange(event) {
        this.zipCode = event.target.value;
        this.validateZipCode();
    }

    handleStartDateChange(event) {
        this.startDate = event.target.value;
        this.validateDateRange();
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value;
        this.validateDateRange();
    }

    validateBirthdate() {
        if (this.birthdate) {
            const today = new Date();
            const birthDate = new Date(this.birthdate);
            
            if (birthDate > today) {
                this.showToast('Error', 'Birthdate cannot be in the future', 'error');
                return false;
            }
        }
        return true;
    }

    validateZipCode() {
        if (this.zipCode) {
            const zipPattern = /^\d{5}(-\d{4})?$/;
            if (!zipPattern.test(this.zipCode)) {
                this.showToast('Error', 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)', 'error');
                return false;
            }
        }
        return true;
    }

    validateDateRange() {
        if (this.startDate && this.endDate) {
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            
            if (start >= end) {
                this.showToast('Error', 'End date must be after start date', 'error');
                return false;
            }
        }
        return true;
    }

    validateForm() {
        let isValid = true;
        const requiredFields = [
            { field: 'firstName', label: 'First Name' },
            { field: 'lastName', label: 'Last Name' },
            { field: 'birthdate', label: 'Birthdate' },
            { field: 'zipCode', label: 'Zip Code' },
            { field: 'startDate', label: 'Start Date' },
            { field: 'endDate', label: 'End Date' }
        ];

        // Check required fields
        for (let fieldInfo of requiredFields) {
            if (!this[fieldInfo.field]) {
                this.showToast('Error', `${fieldInfo.label} is required`, 'error');
                isValid = false;
                break;
            }
        }

        // Validate specific field formats
        if (isValid) {
            isValid = this.validateBirthdate() && 
                     this.validateZipCode() && 
                     this.validateDateRange();
        }

        return isValid;
    }

    handleSubmit() {
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;

        try {
            // Simulate form submission
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'Form submitted successfully!', 'success');
                
                // Log form data for demonstration
                console.log('Form Data Submitted:', {
                    firstName: this.firstName,
                    middleName: this.middleName,
                    lastName: this.lastName,
                    birthdate: this.birthdate,
                    address: this.address,
                    city: this.city,
                    state: this.state,
                    zipCode: this.zipCode,
                    startDate: this.startDate,
                    endDate: this.endDate
                });
            }, 2000);
        } catch (error) {
            this.isLoading = false;
            this.showToast('Error', 'An error occurred while submitting the form', 'error');
            console.error('Form submission error:', error);
        }
    }

    handleReset() {
        this.firstName = '';
        this.middleName = '';
        this.lastName = '';
        this.birthdate = '';
        this.address = '';
        this.city = '';
        this.state = '';
        this.zipCode = '';
        this.startDate = '';
        this.endDate = '';
        this.isLoading = false;
        
        this.showToast('Info', 'Form has been reset', 'info');
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
