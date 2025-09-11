import { LightningElement, track } from 'lwc';

export default class TestRegenerationV1 extends LightningElement {
    @track inputValue = '';

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    handleClick() {
        alert('Button clicked! Input value: ' + this.inputValue);
    }
}