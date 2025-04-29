// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    stateOptions = [
        { label: 'Choose a State', value: '' },
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        { label: 'Texas', value: 'TX' }
    ];

    validateField(event) {
        const field = event.target;
        const fieldName = field.name;
        const fieldValue = field.value;

        this.formData[fieldName] = fieldValue;
        this.errors[fieldName] = '';

        if (field.required && !fieldValue) {
            this.errors[fieldName] = `${fieldName} is required`;
        } else if (fieldName === 'zipCode' && !/^\d{5}$/.test(fieldValue)) {
            this.errors[fieldName] = 'Zip Code must be 5 digits';
        } else if (fieldName === 'endDate' && this.formData.startDate && new Date(fieldValue) <= new Date(this.formData.startDate)) {
            this.errors[fieldName] = 'End Date must be after Start Date';
        }

        field.setCustomValidity(this.errors[fieldName]);
        field.reportValidity();
    }

    handleSubmit() {
        const allFields = this.template.querySelectorAll('lightning-input, lightning-combobox');
        let isValid = true;

        allFields.forEach(field => {
            if (field.reportValidity() === false) {
                isValid = false;
            }
        });

        if (isValid) {
            console.log('Form submitted:', this.formData);
        } else {
            console.error('Form has errors');
        }
    }
}