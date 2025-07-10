import { LightningElement, track } from 'lwc';

export default class MytestForm extends LightningElement {
    @track name = '';

    handleNameChange(event) {
        this.name = event.target.value;
    }

    @api
    isValid() {
        const nameInput = this.template.querySelector('lightning-input[name="name"]');
        return nameInput.reportValidity();
    }

    @api
    getFormData() {
        return {
            name: this.name
        };
    }
}
