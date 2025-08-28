import { LightningElement, api, track } from 'lwc';
import processData from '@salesforce/apex/strandstestlwcv1Controller.processData';

export default class Strandstestlwcv1 extends LightningElement {
    @track inputText = '';
    @track result;
    @api recordId;

    handleInputChange(event) {
        this.inputText = event.target.value;
    }

    handleClick() {
        if (this.inputText) {
            processData({ input: this.inputText })
                .then(result => {
                    this.result = result;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }
}