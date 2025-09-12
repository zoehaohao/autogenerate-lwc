import { LightningElement, track } from 'lwc';

export default class TestRegenerationV4 extends LightningElement {
    @track name = '';
    @track email = '';
    @track acnNumber = '';

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handleAcnNumberChange(event) {
        this.acnNumber = event.target.value;
    }
}