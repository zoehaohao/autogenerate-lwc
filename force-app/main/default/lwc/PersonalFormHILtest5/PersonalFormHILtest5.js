import { LightningElement, api, track } from 'lwc';

export default class PersonalFormHILtest5 extends LightningElement {
    @track formData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    };

    handleFirstNameChange(event) {
        this.formData.firstName = event.target.value;
    }

    handleLastNameChange(event) {
        this.formData.lastName = event.target.value;
    }

    handleEmailChange(event) {
        this.formData.email = event.target.value;
    }

    handlePhoneChange(event) {
        this.formData.phone = event.target.value;
    }

    handleSubmit() {
        // Validate required fields
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (allValid) {
            // Dispatch form submit event
            const submitEvent = new CustomEvent('formsubmit', {
                detail: { ...this.formData }
            });
            this.dispatchEvent(submitEvent);
        }
    }

    handleReset() {
        this.formData = {
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
        };
        
        // Reset all input fields
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });

        // Dispatch form reset event
        this.dispatchEvent(new CustomEvent('formreset'));
    }

    @api
    resetForm() {
        this.handleReset();
    }

    @api
    validateForm() {
        return [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
    }
}