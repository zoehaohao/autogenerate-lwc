// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
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

    get stateOptions() {
        return [
            { label: 'California', value: 'CA' },
            { label: 'New York', value: 'NY' },
            { label: 'Texas', value: 'TX' }
        ];
    }

    get firstNameClass() {
        return `slds-input ${this.firstNameError ? 'error' : ''}`;
    }

    get lastNameClass() {
        return `slds-input ${this.lastNameError ? 'error' : ''}`;
    }

    get birthdateClass() {
        return `slds-input ${this.birthdateError ? 'error' : ''}`;
    }

    get zipCodeClass() {
        return `slds-input ${this.zipCodeError ? 'error' : ''}`;
    }

    get startDateClass() {
        return `slds-input ${this.startDateError ? 'error' : ''}`;
    }

    get endDateClass() {
        return `slds-input ${this.endDateError ? 'error' : ''}`;
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
        this.firstNameError = this.firstName ? '' : 'First name is required';
    }

    validateLastName() {
        this.lastNameError = this.lastName ? '' : 'Last name is required';
    }

    validateBirthdate() {
        this.birthdateError = this.birthdate ? '' : 'Birthdate is required';
    }

    validateZipCode() {
        this.zipCodeError = this.zipCode ? '' : 'Zip code is required';
    }

    validateDates() {
        if (!this.startDate) {
            this.startDateError = 'Start date is required';
        } else if (!this.endDate) {
            this.endDateError = 'End date is required';
        } else if (this.startDate > this.endDate) {
            this.startDateError = 'Start date must be before end date';
            this.endDateError = 'End date must be after start date';
        } else {
            this.startDateError = '';
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
            const formData = {
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
            };
            console.log('Form submitted:', formData);
        }
    }

    handleClear() {
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
        
        this.firstNameError = '';
        this.lastNameError = '';
        this.birthdateError = '';
        this.zipCodeError = '';
        this.startDateError = '';
        this.endDateError = '';
    }
}