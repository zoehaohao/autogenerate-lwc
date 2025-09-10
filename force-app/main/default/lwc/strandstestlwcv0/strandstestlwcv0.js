import { LightningElement, api, track } from 'lwc';
import processData from '@salesforce/apex/strandstestlwcv0Controller.processData';

export default class Strandstestlwcv0 extends LightningElement {
    @api recordId;
    @track inputText = '';
    @track processedResult = '';
    @track error = '';

    handleInputChange(event) {
        this.inputText = event.target.value;
        this.error = ''; // Clear any previous errors
    }

    handleClick() {
        if (!this.inputText) {
            this.error = 'Please enter some text to process';
            return;
        }

        processData({ formData: this.inputText })
            .then(result => {
                this.processedResult = result;
                this.error = '';
                
                // Dispatch success event
                this.dispatchEvent(new CustomEvent('success', {
                    detail: {
                        message: 'Data processed successfully'
                    }
                }));
            })
            .catch(error => {
                this.error = error.body.message;
                this.processedResult = '';
                
                // Dispatch error event
                this.dispatchEvent(new CustomEvent('error', {
                    detail: {
                        error: error.body.message
                    }
                }));
            });
    }

    @api
    refresh() {
        this.inputText = '';
        this.processedResult = '';
        this.error = '';
    }
}