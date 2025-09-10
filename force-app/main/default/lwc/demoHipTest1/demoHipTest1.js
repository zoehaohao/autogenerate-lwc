import { LightningElement, api, track } from 'lwc';

export default class DemoHipTest1 extends LightningElement {
    @api recordId;
    @track inputValue = '';
    @track displayText = '';

    // Handle input change
    handleInputChange(event) {
        this.inputValue = event.target.value;
        // Notify parent of changes
        this.dispatchEvent(new CustomEvent('valuechange', {
            detail: {
                value: this.inputValue
            }
        }));
    }

    // Handle button click
    handleClick() {
        this.displayText = `You entered: ${this.inputValue}`;
        // Notify parent of action
        this.dispatchEvent(new CustomEvent('buttonclick', {
            detail: {
                value: this.inputValue,
                timestamp: new Date().toISOString()
            }
        }));
    }

    // Public method that parent can call
    @api
    clearValues() {
        this.inputValue = '';
        this.displayText = '';
    }
}