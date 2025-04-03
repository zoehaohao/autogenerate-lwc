// detailsForm.js
import { LightningElement, track } from 'lwc';
export default class DetailsForm extends LightningElement {
    @track formData = {
        fullName: '',
        dateOfBirth: '',
        startDate: '',
        endDate: ''
    };
    @track errorMessage = '';
    handleInputChange(event) {
        const field = event.target.dataset.id;
        this.formData[field] = event.target.value;
        this.validateForm();
    }
    validateForm() {
        this.errorMessage = '';
        const { dateOfBirth, startDate, endDate } = this.formData;
        if (dateOfBirth) {
            const age = this.calculateAge(new Date(dateOfBirth));
            if (age < 18) {
                this.errorMessage = 'You must be 18 years or older.';
                return false;
            }
        }
        if (startDate && endDate) {
            if (new Date(startDate) >= new Date(endDate)) {
                this.errorMessage = 'Start Date must be earlier than End Date.';
                return false;
            }
        }
        return true;
    }
    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }
    handleReset() {
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
        this.formData = {
            fullName: '',
            dateOfBirth: '',
            startDate: '',
            endDate: ''
        };
        this.errorMessage = '';
    }
}