import { LightningElement, track } from 'lwc';

export default class TestRegenerationV5 extends LightningElement {
    @track inputText = '';
    @track outputText = '';
    @track showOutput = false;

    handleInputChange(event) {
        this.inputText = event.target.value;
    }

    handleClick() {
        if (this.inputText) {
            this.outputText = `You entered: ${this.inputText}`;
            this.showOutput = true;
            
            // Dispatch custom event
            this.dispatchEvent(new CustomEvent('textchange', {
                detail: {
                    text: this.inputText,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    @api
    resetComponent() {
        this.inputText = '';
        this.outputText = '';
        this.showOutput = false;
    }
}