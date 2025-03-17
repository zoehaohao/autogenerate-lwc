// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        cityTown: '',
        state: '',
        zipCode: ''
    };

    stateOptions = [
        { label: 'Choose a State', value: '' },
        { label: 'Alabama', value: 'AL' },
        { label: 'Alaska', value: 'AK' },
        // ... Add all other states here
    ];

    handleInputChange(event) {
        const field = event.target.name;
        this.formData[field] = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Here you would typically send the data to a server
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.resetForm();
        } else {
            this.showToast('Error', 'Please fill out all required fields correctly', 'error');
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input,lightning-combobox')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        return allValid;
    }

    resetForm() {
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            address: '',
            cityTown: '',
            state: '',
            zipCode: ''
        };
        this.template.querySelectorAll('lightning-input,lightning-combobox').forEach(field => {
            field.value = '';
        });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}