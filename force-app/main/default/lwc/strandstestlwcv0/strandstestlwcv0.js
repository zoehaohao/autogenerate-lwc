import { LightningElement, api, track } from 'lwc';
import processData from '@salesforce/apex/StrandstestlwcV0Controller.processData';

export default class Strandstestlwcv0 extends LightningElement {
    @track inputText = '';
    @track result;
    @track error;

    handleInputChange(event) {
        this.inputText = event.target.value;
    }

    handleClick() {
        if (!this.inputText) {
            return;
        }

        processData({ inputText: this.inputText })
            .then(result => {
                this.result = result;
                this.error = undefined;
                this.dispatchEvent(new CustomEvent('success', {
                    detail: {
                        message: 'Data processed successfully'
                    }
                }));
            })
            .catch(error => {
                this.error = error;
                this.result = undefined;
                this.dispatchEvent(new CustomEvent('error', {
                    detail: {
                        message: error.body.message
                    }
                }));
            });
    }
}