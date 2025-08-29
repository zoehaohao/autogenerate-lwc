import { LightningElement, api, track } from 'lwc';
import lookupAbn from '@salesforce/apex/StrandstestlwcV1Controller.lookupAbn';

export default class Strandstestlwcv1 extends LightningElement {
    @track abnNumber = '';
    @track abnDetails = null;
    @track error = null;
    @track showSpinner = false;

    get isButtonDisabled() {
        return !this.abnNumber || this.abnNumber.length !== 11 || !/^\d+$/.test(this.abnNumber);
    }

    handleAbnChange(event) {
        this.abnNumber = event.target.value;
        this.error = null;
        this.abnDetails = null;
    }

    async handleLookupAbn() {
        if (this.isButtonDisabled) {
            return;
        }

        this.showSpinner = true;
        this.error = null;
        this.abnDetails = null;

        try {
            const result = await lookupAbn({ abnNumber: this.abnNumber });
            if (result.success) {
                this.abnDetails = result.data;
            } else {
                this.error = result.message || 'Failed to lookup ABN. Please try again.';
            }
        } catch (error) {
            this.error = error.body?.message || 'An unexpected error occurred. Please try again.';
        } finally {
            this.showSpinner = false;
        }
    }
}