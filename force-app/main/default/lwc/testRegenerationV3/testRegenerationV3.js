import { LightningElement, api, track } from 'lwc';

export default class TestRegenerationV3 extends LightningElement {
    @api recordId;
    @track inputValue = '';
    @track outputMessage = '';

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
        if (this.inputValue) {
            this.outputMessage = `You entered: ${this.inputValue}`;
            // Dispatch success event
            this.dispatchEvent(new CustomEvent('success', {
                detail: {
                    message: 'Operation completed successfully',
                    value: this.inputValue
                }
            }));
        } else {
            this.outputMessage = 'Please enter a value';
            // Dispatch error event
            this.dispatchEvent(new CustomEvent('error', {
                detail: {
                    message: 'No value entered'
                }
            }));
        }
    }

    @api
    resetComponent() {
        this.inputValue = '';
        this.outputMessage = '';
    }
}