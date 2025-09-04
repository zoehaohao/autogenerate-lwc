import { LightningElement, api, track } from 'lwc';
import processData from '@salesforce/apex/Strandstestlwcv0Controller.processData';

export default class Strandstestlwcv0 extends LightningElement {
    @track inputValue = '';
    @track message = '';
    @track messageClass = '';

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    async handleSubmit() {
        if (!this.inputValue) {
            this.showMessage('Please enter a value', 'slds-text-color_error');
            return;
        }

        try {
            const result = await processData({ input: this.inputValue });
            this.showMessage(result.message, 'slds-text-color_success');
        } catch (error) {
            this.showMessage(error.body?.message || 'An error occurred', 'slds-text-color_error');
        }
    }

    showMessage(msg, cssClass) {
        this.message = msg;
        this.messageClass = cssClass;
    }
}