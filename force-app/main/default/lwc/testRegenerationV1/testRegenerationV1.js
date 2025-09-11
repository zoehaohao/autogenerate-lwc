import { LightningElement, api, track } from 'lwc';

export default class TestRegenerationV1 extends LightningElement {
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
                value: this.inputValue
            }
        }));
    }

    @api
    resetValues() {
        this.inputValue = '';
        this.displayText = '';
    }
}