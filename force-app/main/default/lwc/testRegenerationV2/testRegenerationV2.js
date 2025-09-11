import { LightningElement, api, track } from 'lwc';

export default class TestRegenerationV2 extends LightningElement {
    @api recordId;
    @track inputValue = '';
    @track displayText = '';

    handleInputChange(event) {
        this.inputValue = event.target.value;
        // Dispatch change event for parent components
        this.dispatchEvent(new CustomEvent('valuechange', {
            detail: {
                value: this.inputValue
            }
        }));
    }

    handleClick() {
        this.displayText = `You entered: ${this.inputValue}`;
        // Dispatch click event for parent components
        this.dispatchEvent(new CustomEvent('buttonclick', {
            detail: {
                value: this.inputValue,
                timestamp: new Date().toISOString()
            }
        }));
    }

    @api
    resetValues() {
        this.inputValue = '';
        this.displayText = '';
    }
}