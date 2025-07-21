import { LightningElement, api, track } from 'lwc';

export default class Fields extends LightningElement {
    @track name = '';
    @track address = '';

    handleNameChange(event) {
        this.name = event.target.value;
        this.notifyParent();
    }

    handleAddressChange(event) {
        this.address = event.target.value;
        this.notifyParent();
    }

    @api
    validateFields() {
        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-textarea')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        return allValid;
    }

    @api
    getFieldValues() {
        return {
            name: this.name,
            address: this.address
        };
    }

    notifyParent() {
        const fieldValues = this.getFieldValues();
        this.dispatchEvent(new CustomEvent('fieldchange', {
            detail: fieldValues,
            bubbles: true,
            composed: true
        }));
    }
}
