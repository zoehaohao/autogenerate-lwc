import { LightningElement, api, track } from 'lwc';

export default class TestDemoneo2 extends LightningElement {
    @track inputText = '';
    @track displayText = 'Enter some text and click the button!';

    handleInputChange(event) {
        this.inputText = event.target.value;
    }

    handleClick() {
        if (this.inputText) {
            this.displayText = `You entered: ${this.inputText}`;
        } else {
            this.displayText = 'Please enter some text first!';
        }
    }

    @api
    resetComponent() {
        this.inputText = '';
        this.displayText = 'Enter some text and click the button!';
    }
}