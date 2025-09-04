import { LightningElement, track } from 'lwc';
import processData from '@salesforce/apex/Strandstestlwcv0Controller.processData';

export default class Strandstestlwcv0 extends LightningElement {
    @track inputValue = '';
    @track result;
    @track error;

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    async handleSubmit() {
        try {
            this.result = await processData({ input: this.inputValue });
        } catch (error) {
            this.error = error.message;
            console.error('Error processing data:', error);
        }
    }
}