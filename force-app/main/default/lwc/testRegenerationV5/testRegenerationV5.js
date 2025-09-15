import { LightningElement, api, track } from 'lwc';

export default class TestRegenerationV5 extends LightningElement {
    @api recordId;
    @track inputValue = '';
    @track outputValue = '';
    @track showResult = false;

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
            this.outputValue = `Processed: ${this.inputValue}`;
            this.showResult = true;
            
            // Dispatch success event
            this.dispatchEvent(new CustomEvent('success', {
                detail: {
                    message: 'Operation completed successfully',
                    value: this.outputValue
                }
            }));
        } else {
            // Dispatch error event
            this.dispatchEvent(new CustomEvent('error', {
                detail: {
                    message: 'Please enter a value',
                }
            }));
        }
    }

    @api
    resetComponent() {
        this.inputValue = '';
        this.outputValue = '';
        this.showResult = false;
    }
}