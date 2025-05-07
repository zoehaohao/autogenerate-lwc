// addressForm.js
import { LightningElement, track } from 'lwc';
export default class AddressForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    @track isFormValid = false;
    connectedCallback() {
        this.initializeFormData();
    }
    initializeFormData() {
        this.formData = {
            firstName: '', middleName: '', lastName: '', birthdate: '',
            address: '', city: '', state: '', zipCode: '',
            startDate: '', endDate: ''
        };
    }
    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;
        this.formData[fieldName] = fieldValue;
        this.errors[fieldName] = '';
        switch(fieldName) {
            case 'firstName':
            case 'lastName':
                if (!fieldValue.trim()) {
                    this.errors[fieldName] = `${fieldName} is required`;
                }
                break;
            case 'zipCode':
                if (!/^\d{5}(-\d{4})?$/.test(fieldValue)) {
                    this.errors[fieldName] = 'Invalid zip code';
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!this.isValidDate(fieldValue)) {
                    this.errors[fieldName] = 'Invalid date';
                }
                break;
        }
        if (fieldName === 'endDate' && this.formData.startDate) {
            if (new Date(fieldValue) <= new Date(this.formData.startDate)) {
                this.errors[fieldName] = 'End Date must be after Start Date';
            }
        }
        this.isFormValid = Object.values(this.errors).every(error => !error);
    }
    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
    handleSubmit() {
        if (this.isFormValid) {
            console.log('Form submitted:', this.formData);
        }
    }
    handleClear() {
        this.initializeFormData();
        this.errors = {};
        this.isFormValid = false;
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
        });
    }
}