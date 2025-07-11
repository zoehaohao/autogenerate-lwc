import { LightningElement, track } from 'lwc';

export default class MysmallForm extends LightningElement {
    @track name = '';
    @track address = '';

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleAddressChange(event) {
        this.address = event.target.value;
    }

    @api
    isValid() {
        const nameField = this.template.querySelector('lightning-input[required]');
        return nameField.reportValidity();
    }

    @api
    getFormData() {
        return {
            name: this.name,
            address: this.address
        };
    }
}
