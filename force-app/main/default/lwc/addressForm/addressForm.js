// addressForm.js
import { LightningElement, track } from 'lwc';

export default class AddressForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        birthdate: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        startDate: '',
        endDate: ''
    };

    @track showError = false;
    @track errorMessage = '';
    @track isSubmitDisabled = true;

    stateOptions = [
        { label: 'Alabama', value: 'AL' },
        { label: 'Alaska', value: 'AK' },
        // ... Add all other states here
        { label: 'Wyoming', value: 'WY' }
    ];

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateForm();
    }

    validateForm() {
        const allFieldsValid = [
            'firstName',
            'lastName',
            'birthdate',
            'zipCode',
            'startDate',
            'endDate'
        ].every(field => this.formData[field].trim() !== '');

        if (allFieldsValid) {
            const zipCodeValid = /^\d{5}$/.test(this.formData.zipCode);
            const datesValid = this.validateDates();

            this.isSubmitDisabled = !(zipCodeValid && datesValid);
        } else {
            this.isSubmitDisabled = true;
        }
    }

    validateDates() {
        const start = new Date(this.formData.startDate);
        const end = new Date(this.formData.endDate);
        return start < end;
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Here you would typically call an Apex method to save the data
            console.log('Form submitted:', this.formData);
            this.showError = false;
            this.errorMessage = '';
            // Reset form or show success message
        } else {
            this.showError = true;
            this.errorMessage = 'Please correct the errors in the form before submitting.';
        }
    }

    handleClear() {
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(element => {
            element.value = '';
        });
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            birthdate: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            startDate: '',
            endDate: ''
        };
        this.showError = false;
        this.errorMessage = '';
        this.isSubmitDisabled = true;
    }
}
