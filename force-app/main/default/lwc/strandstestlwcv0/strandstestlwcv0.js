import { LightningElement, api, track } from 'lwc';
import processData from '@salesforce/apex/strandstestlwcv0Controller.processData';

export default class Strandstestlwcv0 extends LightningElement {
    @api recordId;
    @track inputValue = '';
    @track result;
    @track error;

    handleInputChange(event) {
        this.inputValue = event.target.value;
        this.error = null;
        
        // Dispatch change event to parent
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

    async handleProcessData() {
        if (!this.validateInput()) {
            this.error = 'Please enter a valid input';
            return;
        }

        try {
            const response = await processData({ inputData: this.inputValue });
            if (response.success) {
                this.result = response.data;
                this.error = null;
                
                // Notify parent of success
                this.dispatchEvent(new CustomEvent('success', {
                    detail: {
                        result: response.data
                    }
                }));
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.error = error.message || 'An error occurred while processing the data';
            this.result = null;
            
            // Notify parent of error
            this.dispatchEvent(new CustomEvent('error', {
                detail: {
                    error: this.error
                }
            }));
        }
    }

    @api
    reset() {
        this.inputValue = '';
        this.result = null;
        this.error = null;
    }
}