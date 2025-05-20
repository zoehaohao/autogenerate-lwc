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

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }

    validateField(name, value) {
        this.errors[name] = '';
        switch (name) {
            case 'firstName':
            case 'lastName':
            case 'zipCode':
                if (!value.trim()) {
                    this.errors[name] = `${name} is required`;
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!this.isValidDate(value)) {
                    this.errors[name] = 'Invalid date format';
                }
                break;
        }
    }

    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString) && !isNaN(Date.parse(dateString));
    }

    handleSubmit() {
        const allFields = this.template.querySelectorAll('lightning-input, lightning-combobox');
        let isValid = true;

        allFields.forEach(field => {
            const { name, value } = field;
            this.validateField(name, value);
            if (this.errors[name]) {
                isValid = false;
                field.setCustomValidity(this.errors[name]);
            } else {
                field.setCustomValidity('');
            }
            field.reportValidity();
        });

        if (isValid) {
            console.log('Form submitted:', this.formData);
        }
    }
}