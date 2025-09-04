import { LightningElement, api, track } from 'lwc';
import processData from '@salesforce/apex/Strandstestlwcv0Controller.processData';

export default class Strandstestlwcv0 extends LightningElement {
    @track inputText = '';
    @track result;
    @track error;

    handleInputChange(event) {
        this.inputText = event.target.value;
    }

    async handleClick() {
        try {
            this.result = undefined;
            this.error = undefined;
            
            const response = await processData({ inputText: this.inputText });
            if (response.success) {
                this.result = response.message;
                this.dispatchEvent(new CustomEvent('success', {
                    detail: response
                }));
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.error = error.message;
            this.dispatchEvent(new CustomEvent('error', {
                detail: {
                    error: this.error
                }
            }));
        }
    }
}