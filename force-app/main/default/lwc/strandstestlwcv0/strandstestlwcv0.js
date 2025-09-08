import { LightningElement, api, track } from 'lwc';
import processData from '@salesforce/apex/StrandstestlwcV0Controller.processData';

export default class Strandstestlwcv0 extends LightningElement {
    @track inputText = '';
    @track result;
    @track error;

    handleInputChange(event) {
        this.inputText = event.target.value;
    }

    async handleClick() {
        if (!this.inputText) {
            return;
        }

        try {
            this.result = await processData({ input: this.inputText });
        } catch (error) {
            this.error = error.message;
            console.error('Error processing data:', error);
        }
    }

    handleClear() {
        this.inputText = '';
        this.result = null;
        this.error = null;
    }

    @api
    refresh() {
        this.handleClear();
    }
}