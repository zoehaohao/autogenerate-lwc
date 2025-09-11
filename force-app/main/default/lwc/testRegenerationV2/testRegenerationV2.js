import { LightningElement, track } from 'lwc';

export default class TestRegenerationV2 extends LightningElement {
    @track inputValue = '';

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }
}