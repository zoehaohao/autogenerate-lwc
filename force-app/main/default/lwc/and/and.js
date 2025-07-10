import { LightningElement, track } from 'lwc';
import saveContact from '@salesforce/apex/andController.saveContact';

export default class And extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track errorMessage = '';

    handleInputChange(event) {
        const { name, value } = event.target;
        this[name] = value;
        this.errorMessage = ''; // Clear any previous error
    }

    get isInvalid() {
        return !this.firstName.trim() || !this.lastName.trim();
    }

    validateForm() {
        let isValid = true;
        let errorMessages = [];

        if (!this.firstName.trim()) {
            errorMessages.push('First Name is required');
            isValid = false;
        }

        if (!this.lastName.trim()) {
            errorMessages.push('Last Name is required');
            isValid = false;
        }

        if (!isValid) {
            this.errorMessage = errorMessages.join(', ');
        }

        return isValid;
    }

    async handleSave() {
        if (!this.validateForm()) {
            return;
        }

        try {
            const result = await saveContact({
                firstName: this.firstName,
                lastName: this.lastName
            });

            if (result.success) {
                // Reset form
                this.firstName = '';
                this.lastName = '';
                this.dispatchEvent(
                    new CustomEvent('success', {
                        detail: { message: 'Contact saved successfully!' }
                    })
                );
            } else {
                this.errorMessage = result.message || 'Error saving contact';
            }
        } catch (error) {
            this.errorMessage = error.message || 'An unexpected error occurred';
        }
    }
}
