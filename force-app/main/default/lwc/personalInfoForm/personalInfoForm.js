// personalInfoForm.js
import { LightningElement, track } from 'lwc';
export default class PersonalInfoForm extends LightningElement {
    @track errors = {};
    stateOptions = [
        { value: 'AL', label: 'Alabama' },
        { value: 'AK', label: 'Alaska' },
        { value: 'AZ', label: 'Arizona' },
    ];
    validateField(event) {
        const fieldName = event.target.id;
        const fieldValue = event.target.value;
        let errorMessage = '';
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!fieldValue.trim()) {
                    errorMessage = `${fieldName === 'firstName' ? 'First' : 'Last'} Name is required`;
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!fieldValue) {
                    errorMessage = 'Date is required';
                } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fieldValue)) {
                    errorMessage = 'Invalid date format';
                }
                break;
            case 'zipCode':
                if (!fieldValue.trim()) {
                    errorMessage = 'Zip Code is required';
                } else if (!/^\d{5}(?:[-\s]\d{4})?$/.test(fieldValue)) {
                    errorMessage = 'Invalid Zip Code format';
                }
                break;
        }
        this.errors = { ...this.errors, [fieldName]: errorMessage };
    }
    handleSubmit() {
        this.template.querySelectorAll('input, select').forEach(element => {
            this.validateField({ target: element });
        });
        if (Object.values(this.errors).every(error => !error)) {
            console.log('Form submitted successfully');
        } else {
            console.log('Form has errors');
        }
    }
}