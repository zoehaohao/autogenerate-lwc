// appointmentFormLwc.js
import { LightningElement, track } from 'lwc';

export default class AppointmentFormLwc extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    };

    @track errors = {};
    @track isLoading = false;

    stateOptions = [
        { label: 'New South Wales', value: 'NSW' },
        { label: 'Queensland', value: 'QLD' },
        { label: 'South Australia', value: 'SA' },
        { label: 'Tasmania', value: 'TAS' },
        { label: 'Victoria', value: 'VIC' },
        { label: 'Western Australia', value: 'WA' },
        { label: 'Australian Capital Territory', value: 'ACT' },
        { label: 'Northern Territory', value: 'NT' }
    ];

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.errors[name] = '';
    }

    validateForm() {
        const errors = {};

        if (!this.formData.firstName) {
            errors.firstName = 'First Name is required.';
        }

        if (!this.formData.lastName) {
            errors.lastName = 'Last Name is required.';
        }

        if (!this.formData.zipCode) {
            errors.zipCode = 'Zip Code is required.';
        } else if (!/^\d{4}$/.test(this.formData.zipCode)) {
            errors.zipCode = 'Please enter a valid 4-digit Australian postcode.';
        }

        this.errors = errors;
        return Object.keys(errors).length === 0;
    }

    handleSubmit() {
        this.isLoading = true;

        if (this.validateForm()) {
            // Submit form data to server or perform other actions
            console.log('Form data:', this.formData);

            // Simulating a delay for demonstration purposes
            setTimeout(() => {
                this.isLoading = false;
                // Reset form or show success message
            }, 2000);
        } else {
            this.isLoading = false;
        }
    }

    handleCancel() {
        // Reset form or navigate away
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zipCode: ''
        };
        this.errors = {};
    }
}
