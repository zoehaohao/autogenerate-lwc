// nameFormatter.js
import { LightningElement, track } from 'lwc';

export default class NameFormatter extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track formattedName = '';
    @track errorMessage = '';

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
    }

    handleFormat() {
        if (this.validateInputs()) {
            this.formattedName = this.formatName(this.firstName) + ' ' + this.formatName(this.lastName);
            this.errorMessage = '';
        }
    }

    handleClear() {
        this.firstName = '';
        this.lastName = '';
        this.formattedName = '';
        this.errorMessage = '';
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
    }

    showHelp(event) {
        event.preventDefault();
        // Implement help functionality here
    }

    validateInputs() {
        const inputs = this.template.querySelectorAll('lightning-input');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        if (!isValid) {
            this.errorMessage = 'Please correct the errors above.';
        }

        return isValid;
    }

    formatName(name) {
        return name.trim().replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase());
    }
}