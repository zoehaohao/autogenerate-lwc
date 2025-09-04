import { LightningElement, api } from 'lwc';
import processData from '@salesforce/apex/strandstestlwcv0Controller.processData';

export default class Strandstestlwcv0 extends LightningElement {
    @api recordId;
    
    inputValue = '';
    result = '';
    error = '';
    isProcessing = false;

    handleInputChange(event) {
        this.inputValue = event.target.value;
        this.error = '';
        
        // Notify parent of change
        this.dispatchEvent(new CustomEvent('valuechange', {
            detail: {
                value: this.inputValue,
                isValid: this.validateInput()
            }
        }));
    }

    validateInput() {
        return this.inputValue && this.inputValue.length > 0;
    }

    async handleClick() {
        if (!this.validateInput()) {
            this.error = 'Please enter a valid input';
            return;
        }

        this.isProcessing = true;
        this.error = '';
        this.result = '';

        try {
            const response = await processData({ inputString: this.inputValue });
            this.result = response.message;
            
            // Notify parent of success
            this.dispatchEvent(new CustomEvent('success', {
                detail: {
                    result: response
                }
            }));
        } catch (error) {
            this.error = error.body?.message || 'An error occurred while processing the request';
            
            // Notify parent of error
            this.dispatchEvent(new CustomEvent('error', {
                detail: {
                    error: this.error
                }
            }));
        } finally {
            this.isProcessing = false;
        }
    }

    @api
    resetComponent() {
        this.inputValue = '';
        this.result = '';
        this.error = '';
        this.isProcessing = false;
    }
}