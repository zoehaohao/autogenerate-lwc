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
    @track isFormValid = false;

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateForm();
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate', 'endDate'];
        const isAllRequiredFieldsFilled = requiredFields.every(field => this.formData[field].trim() !== '');
        
        if (!isAllRequiredFieldsFilled) {
            this.errorMessage = 'Please fill in all required fields.';
            this.isFormValid = false;
            return;
        }

        if (!/^\d{5}(-\d{4})?$/.test(this.formData.zipCode)) {
            this.errorMessage = 'Invalid Zip Code format.';
            this.isFormValid = false;
            return;
        }

        const startDate = new Date(this.formData.startDate);
        const endDate = new Date(this.formData.endDate);
        if (endDate <= startDate) {
            this.errorMessage = 'End Date must be after Start Date.';
            this.isFormValid = false;
            return;
        }

        this.errorMessage = '';
        this.isFormValid = true;
    }

    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', this.formData);
            // Here you would typically send the data to a server
            // Reset form after successful submission
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
            this.isFormValid = false;
            // Show success message (you might want to use a toast notification here)
            alert('Form submitted successfully!');
        }
    }
}