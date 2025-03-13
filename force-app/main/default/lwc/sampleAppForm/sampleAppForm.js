// sampleAppForm.js
import { LightningElement, track } from 'lwc';

export default class SampleAppForm extends LightningElement {
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
        // ... add all other states here
    ];

    handleInputChange(event) {
        const field = event.target.name;
        this.formData[field] = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Process form submission
            console.log('Form submitted:', this.formData);
            // Here you would typically call an Apex method to save the data
        } else {
            // Show error message
            this.showToast('Error', 'Please fill all required fields correctly.', 'error');
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        return allValid;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}