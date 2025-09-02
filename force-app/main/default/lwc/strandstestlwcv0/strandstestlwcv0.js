import { LightningElement, api, track } from 'lwc';
import processData from '@salesforce/apex/strandstestlwcv0Controller.processData';

export default class Strandstestlwcv0 extends LightningElement {
    @api recordId;
    @track inputText = '';
    @track result;
    @track error;

    handleInputChange(event) {
        this.inputText = event.target.value;
        this.error = null;
        this.result = null;
    }

    async handleClick() {
        if (!this.inputText) {
            this.error = 'Please enter some text';
            return;
        }

        try {
            const response = await processData({ inputText: this.inputText });
            if (response.success) {
                this.result = response.data;
                this.error = null;
                this.dispatchEvent(new CustomEvent('success', {
                    detail: {
                        message: 'Data processed successfully',
                        data: response.data
                    }
                }));
            } else {
                this.error = response.message;
                this.result = null;
            }
        } catch (error) {
            this.error = error.message || 'An unexpected error occurred';
            this.result = null;
            this.dispatchEvent(new CustomEvent('error', {
                detail: {
                    error: this.error
                }
            }));
        }
    }
}