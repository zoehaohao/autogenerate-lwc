import { LightningElement, api, track } from 'lwc';

export default class Fields extends LightningElement {
    @track name = '';
    @track email = '';
    @track phone = '';
    @track company = '';

    handleNameChange(event) {
        this.name = event.target.value;
        this.notifyParent();
    }

    handleEmailChange(event) {
        this.email = event.target.value;
        this.notifyParent();
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
        this.notifyParent();
    }

    handleCompanyChange(event) {
        this.company = event.target.value;
        this.notifyParent();
    }

    @api
    validateFields() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
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
            email: this.email,
            phone: this.phone,
            company: this.company
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
