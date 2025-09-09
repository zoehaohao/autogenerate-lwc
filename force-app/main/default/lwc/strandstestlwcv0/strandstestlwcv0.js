import { LightningElement, track } from 'lwc';
import processText from '@salesforce/apex/strandstestlwcv0Controller.processText';

export default class Strandstestlwcv0 extends LightningElement {
    @track inputText = '';
    @track result;
    @track error;

    handleInputChange(event) {
        this.inputText = event.target.value;
        this.result = undefined;
        this.error = undefined;
    }

    async handleClick() {
        if (!this.inputText) {
            this.error = 'Please enter some text';
            return;
        }

        try {
            this.result = await processText({ inputText: this.inputText });
            this.error = undefined;
        } catch (error) {
            this.error = error.body.message;
            this.result = undefined;
        }
    }
}