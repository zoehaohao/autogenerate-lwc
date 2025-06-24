import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track firstName = '';
    @track middleName = '';
    @track lastName = '';
    @track address = '';
    @track city = '';
    @track selectedState = '';
    @track zipCode = '';

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
        return !this.firstName || !this.lastName || !this.zipCode;
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

    handleAddressChange(event) {
        this.address = event.target.value;
    }

    handleCityChange(event) {
        this.city = event.target.value;
    }

    handleStateChange(event) {
        this.selectedState = event.detail.value;
    }

    handleZipCodeChange(event) {
        this.zipCode = event.target.value;
    }

    handleReset() {
        try {
            this.firstName = '';
            this.middleName = '';
            this.lastName = '';
            this.address = '';
            this.city = '';
            this.selectedState = '';
            this.zipCode = '';

            this.showToast('Success', 'Form has been reset successfully.', 'success');
        } catch (error) {
            this.showToast('Error', 'An error occurred while resetting the form.', 'error');
        }
    }

    handleSubmit() {
        try {
            if (this.validateForm()) {
                const formData = {
                    firstName: this.firstName,
                    middleName: this.middleName,
                    lastName: this.lastName,
                    address: this.address,
                    city: this.city,
                    state: this.selectedState,
                    zipCode: this.zipCode
                };

                console.log('Form submitted with data:', formData);
                this.showToast('Success', 'Form submitted successfully!', 'success');
            }
        } catch (error) {
            this.showToast('Error', 'An error occurred while submitting the form.', 'error');
        }
    }

    validateForm() {
        let isValid = true;
        const inputFields = this.template.querySelectorAll('lightning-input');
        
        inputFields.forEach(field => {
            if (!field.checkValidity()) {
                field.reportValidity();
                isValid = false;
            }
        });

        // Additional validation for required fields
        if (!this.firstName) {
            this.showToast('Error', 'First name is required.', 'error');
            isValid = false;
        }

        if (!this.lastName) {
            this.showToast('Error', 'Last name is required.', 'error');
            isValid = false;
        }

        if (!this.zipCode) {
            this.showToast('Error', 'Zip code is required.', 'error');
            isValid = false;
        }

        // Validate zip code format (basic US zip code validation)
        if (this.zipCode && !/^\d{5}(-\d{4})?$/.test(this.zipCode)) {
            this.showToast('Error', 'Please enter a valid zip code (e.g., 12345 or 12345-6789).', 'error');
            isValid = false;
        }

        return isValid;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
}
