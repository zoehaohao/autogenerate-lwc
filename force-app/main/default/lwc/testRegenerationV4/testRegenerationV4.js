import { LightningElement, api, track } from 'lwc';

export default class TestRegenerationV4 extends LightningElement {
    @track inputValue = '';
    
    @api recordId;
    
    handleInputChange(event) {
        this.inputValue = event.target.value;
        this.dispatchEvent(new CustomEvent('valuechange', {
            detail: {
                value: this.inputValue
            }
        }));
    }
    
    handleSubmit() {
        const submitEvent = new CustomEvent('submit', {
            detail: {
                value: this.inputValue,
                recordId: this.recordId
            }
        });
        this.dispatchEvent(submitEvent);
    }

    @api
    resetInput() {
        this.inputValue = '';
    }
}