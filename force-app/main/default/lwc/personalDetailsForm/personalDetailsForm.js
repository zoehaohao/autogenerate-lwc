import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track countryOptions = [
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' },
        { label: 'United Kingdom', value: 'UK' }
    ];

    handleSubmit() {
        if (this.validateForm()) {
            this.showToast('Success', 'Form submitted successfully', 'success');
        } else {
            this.showToast('Error', 'Please fill all required fields', 'error');
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input,lightning-textarea,lightning-combobox')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        return allValid;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({title, message, variant}));
    }
}