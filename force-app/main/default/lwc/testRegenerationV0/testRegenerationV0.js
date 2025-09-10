import { LightningElement, api, track } from 'lwc';
import processData from '@salesforce/apex/testRegenerationV0Controller.processData';

export default class TestRegenerationV0 extends LightningElement {
    @api recordId;
    @track inputValue = '';
    @track outputMessage = '';
    
    handleInputChange(event) {
        this.inputValue = event.target.value;
    }
    
    async handleClick() {
        try {
            const result = await processData({ formData: this.inputValue });
            if (result.success) {
                this.outputMessage = result.message;
                this.dispatchEvent(new CustomEvent('success', {
                    detail: {
                        message: result.message
                    }
                }));
            } else {
                this.handleError(result.message);
            }
        } catch (error) {
            this.handleError(error.body?.message || 'An error occurred while processing the request');
        }
    }
    
    handleError(message) {
        this.outputMessage = `Error: ${message}`;
        this.dispatchEvent(new CustomEvent('error', {
            detail: {
                message: message
            }
        }));
    }
}