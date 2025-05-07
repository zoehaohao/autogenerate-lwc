// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
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

    @track errorMessage = '';

    stateOptions = [
        { label: 'Select State', value: '' },
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        { label: 'Texas', value: 'TX' }
    ];

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.errorMessage = '';
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        }
    }

    handleClear() {
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
        this.errorMessage = '';
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
        inputs.forEach(input => input.value = '');
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate', 'endDate'];
        const missingFields = requiredFields.filter(field => !this.formData[field]);

        if (missingFields.length) {
            this.errorMessage = 'Please fill in all required fields';
            return false;
        }

        if (this.formData.startDate && this.formData.endDate) {
            if (new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
                this.errorMessage = 'End Date must be after Start Date';
                return false;
            }
        }

        return true;
    }
}