// detailsForm.js
import { LightningElement, track } from 'lwc';

export default class DetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.errorMessage = '';
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }

    validateForm() {
        const { fullName, dateOfBirth, startDate, endDate, postcode } = this.formData;

        if (!fullName || !dateOfBirth || !startDate || !endDate || !postcode) {
            this.errorMessage = 'All fields are required.';
            return false;
        }

        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age <= 18) {
            this.errorMessage = 'Applicant must be over 18 years old.';
            return false;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            this.errorMessage = 'End date must be after start date.';
            return false;
        }

        if (!/^\d{4}$/.test(postcode)) {
            this.errorMessage = 'Postcode must be 4 digits.';
            return false;
        }

        return true;
    }
}