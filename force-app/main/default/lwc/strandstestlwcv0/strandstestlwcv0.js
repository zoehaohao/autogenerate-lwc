import { LightningElement, api, track } from 'lwc';

export default class Strandstestlwcv0 extends LightningElement {
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
    
    handleClick() {
        this.dispatchEvent(new CustomEvent('buttonclick', {
            detail: {
                value: this.inputValue
            }
        }));
    }
}