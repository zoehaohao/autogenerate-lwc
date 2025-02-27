import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
    ];

    @track countryOptions = [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' }
    ];

    @track stateOptions = [
        { label: 'California', value: 'ca' },
        { label: 'New York', value: 'ny' }
    ];

    handleSubmit(event) {
        event.preventDefault();
        const isValid = this.validateForm();
        if (isValid) {
            this.showToast('Success', 'Form submitted successfully', 'success');
        }
    }

    validateForm() {
        const inputFields = this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea');
        let isValid = true;
        inputFields.forEach(field => {
            if (field.required && !field.value) {
                field.reportValidity();
                isValid = false;
            }
            if (field.type === 'email' && field.value && !this.validateEmail(field.value)) {
                field.setCustomValidity('Please enter a valid email address');
                field.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }

    validateEmail(email) {
        return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
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