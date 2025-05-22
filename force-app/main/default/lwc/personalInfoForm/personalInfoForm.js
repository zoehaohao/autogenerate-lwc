// personalInfoForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    };
    @track errorMessage = '';
    stateOptions = [
        { value: 'AL', label: 'Alabama' },
        { value: 'AK', label: 'Alaska' },
        // ... add all other states here
        { value: 'WY', label: 'Wyoming' }
    ];

    handleSubmit() {
        if (this.validateForm()) {
            // Form submission logic here
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.handleReset();
        }
    }

    handleReset() {
        this.template.querySelectorAll('input, select').forEach(field => {
            field.value = '';
        });
        this.formData = { ...this.formData, firstName: '', middleName: '', lastName: '', address: '', city: '', state: '', zipCode: '' };
        this.errorMessage = '';
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.id;
        const fieldValue = field.value;
        let isValid = true;

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                isValid = fieldValue.trim() !== '';
                break;
            case 'zipCode':
                isValid = /^\d{5}(-\d{4})?$/.test(fieldValue);
                break;
        }

        if (!isValid) {
            field.classList.add('acme-input_error');
            this.errorMessage = `Please enter a valid ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
        } else {
            field.classList.remove('acme-input_error');
            this.errorMessage = '';
        }

        this.formData[fieldName] = fieldValue;
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('input, select').forEach(field => {
            if (field.required && !field.value) {
                field.classList.add('acme-input_error');
                isValid = false;
            }
        });

        if (!isValid) {
            this.errorMessage = 'Please fill in all required fields';
        }

        return isValid;
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