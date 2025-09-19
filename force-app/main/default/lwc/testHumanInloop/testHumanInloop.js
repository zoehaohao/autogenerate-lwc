import { LightningElement, track } from 'lwc';

export default class TestHumanInloop extends LightningElement {
    @track inputText = '';
    @track showMessage = false;
    @track displayMessage = '';

    handleInputChange(event) {
        this.inputText = event.target.value;
        this.showMessage = false;
    }

    handleClick() {
        if (this.inputText) {
            this.displayMessage = `You entered: ${this.inputText}`;
            this.showMessage = true;
        } else {
            this.displayMessage = 'Please enter some text first';
            this.showMessage = true;
        }
    }
}