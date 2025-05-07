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

    @track errors = {};
    @track errorSummary = '';
    
    get stateOptions() {
        return [
            { label: 'Alabama', value: 'AL' },
            { label: 'Alaska', value: 'AK' }
        ];
    }

    get isSubmitDisabled() {
        return Object.keys(this.errors).length > 0 || !this.isRequiredFieldsFilled();
    }

    isRequiredFieldsFilled() {
        return this.formData.firstName && 
               this.formData.lastName && 
               this.formData.birthdate && 
               this.formData.zipCode &&
               this.formData.startDate &&
               this.formData.endDate;
    }

    validateField(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.errors[field] = '';

        switch(field) {
            case 'firstName':
            case 'lastName':
                if (!value) {
                    this.errors[field] = `${field === 'firstName' ? 'First' : 'Last'} name is required`;
                }
                break;
            
            case 'birthdate':
                if (!value) {
                    this.errors[field] = 'Birthdate is required';
                } else {
                    const age = this.calculateAge(new Date(value));
                    if (age < 18) {
                        this.errors[field] = 'Must be 18 or older';
                    }
                }
                break;

            case 'zipCode':
                if (!value) {
                    this.errors[field] = 'Zip code is required';
                } else if (!/^\d{5}$/.test(value)) {
                    this.errors[field] = 'Enter a valid 5-digit zip code';
                }
                break;

            case 'startDate':
            case 'endDate':
                if (!value) {
                    this.errors[field] = `${field === 'startDate' ? 'Start' : 'End'} date is required`;
                } else if (field === 'endDate' && this.formData.startDate && value <= this.formData.startDate) {
                    this.errors[field] = 'End date must be after start date';
                }
                break;
        }

        this.updateErrorSummary();
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

    updateErrorSummary() {
        const errorMessages = Object.values(this.errors).filter(error => error);
        this.errorSummary = errorMessages.length ? 'Please correct the following errors:' : '';
    }

    handleSubmit() {
        if (!this.isSubmitDisabled) {
            console.log('Form submitted:', this.formData);
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
        this.errors = {};
        this.errorSummary = '';
    }
}