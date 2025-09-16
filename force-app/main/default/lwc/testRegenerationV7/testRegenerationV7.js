import { LightningElement, track } from 'lwc';

export default class TestRegenerationV7 extends LightningElement {
    @track inputText = '';
    @track displayText = 'Enter some text and click the button!';

    handleInputChange(event) {
        this.inputText = event.target.value;
    }

    handleClick() {
        if (this.inputText) {
            this.displayText = `You entered: ${this.inputText}`;
            this.dispatchEvent(new CustomEvent('textchange', {
                detail: {
                    text: this.inputText,
                    timestamp: new Date().toISOString()
                }
            }));
        } else {
            this.displayText = 'Please enter some text first!';
        }
    }
}