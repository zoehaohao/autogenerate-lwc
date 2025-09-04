import { LightningElement, api, track } from 'lwc';
import processData from '@salesforce/apex/StrandstestlwcV0Controller.processData';

export default class Strandstestlwcv0 extends LightningElement {
    @track inputValue = '';
    @track result = '';
    
    handleInputChange(event) {
        this.inputValue = event.target.value;
    }
    
    async handleSubmit() {
        try {
            this.result = await processData({ input: this.inputValue });
        } catch (error) {
            console.error('Error processing data:', error);
            this.result = 'Error processing request. Please try again.';
        }
    }
}