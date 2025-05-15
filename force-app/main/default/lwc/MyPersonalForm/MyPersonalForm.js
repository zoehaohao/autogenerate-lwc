// MyPersonalForm.js
import { LightningElement, track } from 'lwc';

export default class MyPersonalForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        familyName: '',
        birthdate: '',
        address: '',
        cityTown: '',
        state: '',
        zipCode: '',
        startDate: '',
        endDate: ''
    };
    @track errorMessage = '';
    @track successMessage = '';
    @track isSubmitDisabled = true;

    usStates = [
        { value: 'AL', label: 'Alabama' },
        { value: 'AK', label: 'Alaska' },
        // ... (other states)
        { value: 'WY', label: 'Wyoming' }
    ];

    connectedCallback() {
        this.populateStateOptions();
    }

    populateStateOptions() {
        const stateSelect = this.template.querySelector('[name="state"]');
        this.usStates.forEach(state => {
            const option = document.createElement('option');
            option.value = state.value;
            option.textContent = state.label;
            stateSelect.appendChild(option);
        });
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateForm();
    }

    validateForm() {
        this.errorMessage = '';
        this.isSubmitDisabled = false;

        if (!this.formData.firstName || !this.formData.familyName || !this.formData.birthdate || !this.formData.zipCode || !this.formData.startDate || !this.formData.endDate) {
            this.isSubmitDisabled = true;
            return;
        }

        if (!this.validateAge(this.formData.birthdate)) {
            this.errorMessage = 'You must be at least 18 years old.';
            this.isSubmitDisabled = true;
            return;
        }

        if (!this.validateZipCode(this.formData.zipCode)) {
            this.errorMessage = 'Please enter a valid 5-digit zip code.';
            this.isSubmitDisabled = true;
            return;
        }

        if (!this.validateDateRange(this.formData.startDate, this.formData.endDate)) {
            this.errorMessage = 'End Date must be after Start Date.';
            this.isSubmitDisabled = true;
            return;
        }
    }

    validateAge(birthdate) {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }

    validateZipCode(zipCode) {
        return /^\d{5}$/.test(zipCode);
    }

    validateDateRange(startDate, endDate) {
        return new Date(endDate) > new Date(startDate);
    }

    handleSubmit(event) {
        event.preventDefault();
        if (!this.isSubmitDisabled) {
            this.successMessage = 'Form submitted successfully!';
            this.errorMessage = '';
            console.log('Form data:', this.formData);
        }
    }

    handleClear() {
        this.formData = {
            firstName: '',
            middleName: '',
            familyName: '',
            birthdate: '',
            address: '',
            cityTown: '',
            state: '',
            zipCode: '',
            startDate: '',
            endDate: ''
        };
        this.errorMessage = '';
        this.successMessage = '';
        this.isSubmitDisabled = true;
        this.template.querySelectorAll('input, select').forEach(input => {
            input.value = '';
        });
    }
}