import { LightningElement, track } from 'lwc';

export default class QfrFormTest extends LightningElement {
    @track firstName = '';
    @track middleName = '';
    @track lastName = '';
    @track birthdate = '';
    @track address = '';
    @track city = '';
    @track selectedState = '';
    @track zipCode = '';
    @track startDate = '';
    @track endDate = '';

    get stateOptions() {
        return [
            { label: 'Choose a State', value: '' },
            { label: 'Alabama', value: 'AL' },
            { label: 'Alaska', value: 'AK' },
            { label: 'Arizona', value: 'AZ' },
            // Add all other states here
        ];
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
    }

    handleAddressChange(event) {
        this.address = event.target.value;
    }

    handleCityChange(event) {
        this.city = event.target.value;
    }

    handleStateChange(event) {
        this.selectedState = event.target.value;
    }

    handleZipCodeChange(event) {
        this.zipCode = event.target.value;
    }

    handleStartDateChange(event) {
        this.startDate = event.target.value;
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value;
    }

    @api
    validateFields() {
        const inputFields = this.template.querySelectorAll('lightning-input');
        let isValid = true;

        inputFields.forEach(field => {
            if (field.required && !field.value) {
                field.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }
}
