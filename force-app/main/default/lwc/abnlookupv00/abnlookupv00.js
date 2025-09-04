import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnlookupv00Controller.searchABN';

export default class Abnlookupv00 extends LightningElement {
    @track abnNumber = '';
    @track abnDetails;
    @track error;
    @track isLoading = false;

    get isSearchDisabled() {
        return !this.abnNumber || this.abnNumber.length !== 11 || this.isLoading;
    }

    handleAbnChange(event) {
        this.abnNumber = event.target.value;
        this.abnDetails = null;
        this.error = null;
    }

    async handleSearch() {
        if (this.isSearchDisabled) return;

        this.isLoading = true;
        this.abnDetails = null;
        this.error = null;

        try {
            const result = await searchABN({ abnNumber: this.abnNumber });
            if (result.success) {
                this.abnDetails = result.data;
                this.dispatchEvent(new CustomEvent('abnfound', {
                    detail: result.data,
                    bubbles: true,
                    composed: true
                }));
            } else {
                this.error = result.message || 'Failed to retrieve ABN details';
            }
        } catch (error) {
            this.error = error.message || 'An unexpected error occurred';
        } finally {
            this.isLoading = false;
        }
    }
}