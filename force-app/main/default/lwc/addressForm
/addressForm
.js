// addressForm.js
import { LightningElement, track } from 'lwc';

export default class AddressForm extends LightningElement {
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

    @track firstNameError = '';
    @track lastNameError = '';
    @track birthdateError = '';
    @track zipCodeError = '';
    @track startDateError = '';
    @track endDateError = '';

    get firstNameClass() {
        return this.firstNameError ? 'error' : '';
    }

    get lastNameClass() {
        return this.lastNameError ? 'error' : '';
    }

    get birthdateClass() {
        return this.birthdateError ? 'error' : '';
    }

    get zipCodeClass() {
        return this.zipCodeError ? 'error' : '';
    }

    get startDateClass() {
        return this.startDateError ? 'error' : '';
    }

    get endDateClass() {
        return this.endDateError ? 'error' : '';
    }

    get stateOptions() {
        return [
            { label: 'California', value: 'CA' },
            { label: 'New York', value: 'NY' },
            { label: 'Texas', value: 'TX' }
        ];
    }

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.validateFirstName();
    }

    handleMiddleNameChange(event) {
        this.middleName = event.target.value;
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
        this.validateLastName();
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
        this.validateDates();
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value;
        this.validateDates();
    }

    validateFirstName() {
        this.firstNameError = this.firstName ? '' : 'First Name is required';
    }

    validateLastName() {
        this.lastNameError = this.lastName ? '' : 'Last Name is required';
    }

    validateBirthdate() {
        this.birthdateError = this.birthdate ? '' : 'Birthdate is required';
    }

    validateZipCode() {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        this.zipCodeError = this.zipCode ? 
            (zipRegex.test(this.zipCode) ? '' : 'Invalid ZIP Code format') : 
            'ZIP Code is required';
    }

    validateDates() {
        if (!this.startDate) {
            this.startDateError = 'Start Date is required';
        } else {
            this.startDateError = '';
        }

        if (!this.endDate) {
            this.endDateError = 'End Date is required';
        } else if (this.startDate && this.endDate && this.endDate < this.startDate) {
            this.endDateError = 'End Date must be after Start Date';
        } else {
            this.endDateError = '';
        }
    }

    validateForm() {
        this.validateFirstName();
        this.validateLastName();
        this.validateBirthdate();
        this.validateZipCode();
        this.validateDates();

        return !this.firstNameError && !this.lastNameError && !this.birthdateError && 
               !this.zipCodeError && !this.startDateError && !this.endDateError;
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted successfully');
        }
    }
}