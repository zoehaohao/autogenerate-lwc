import { LightningElement, track } from 'lwc';

export default class MytestForm extends LightningElement {
    @track name = '';
    @track address = '';

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleAddressChange(event) {
        this.address = event.target.value;
    }
}
