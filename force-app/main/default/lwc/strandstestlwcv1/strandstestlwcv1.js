import { LightningElement, api, track } from 'lwc';
import lookupAbn from '@salesforce/apex/strandstestlwcv1Controller.lookupAbn';

export default class Strandstestlwcv1 extends LightningElement {
    @api recordId;
    @track abnNumber = '';
    @track businessInfo = null;
    @track errorMessage = '';
    @track isLoading = false;

    handleAbnChange(event) {
        this.abnNumber = event.target.value;
        this.errorMessage = '';
    }

    async handleLookup() {
        if (!this.abnNumber || this.abnNumber.trim() === '') {
            this.errorMessage = 'Please enter an ABN number';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.businessInfo = null;

        try {
            const result = await lookupAbn({ abnNumber: this.abnNumber });
            
            if (result.success) {
                this.businessInfo = result.data;
                this.dispatchEvent(new CustomEvent('abnlookup', {
                    detail: {
                        componentName: 'strandstestlwcv1',
                        abnNumber: this.abnNumber,
                        businessInfo: this.businessInfo,
                        timestamp: new Date().toISOString()
                    },
                    bubbles: true,
                    composed: true
                }));
            } else {
                this.errorMessage = result.message || 'Failed to lookup ABN';
                this.dispatchEvent(new CustomEvent('error', {
                    detail: {
                        componentName: 'strandstestlwcv1',
                        errorMessage: this.errorMessage,
                        timestamp: new Date().toISOString()
                    },
                    bubbles: true,
                    composed: true
                }));
            }
        } catch (error) {
            this.errorMessage = 'An error occurred while looking up ABN: ' + error.body?.message || error.message;
            this.dispatchEvent(new CustomEvent('error', {
                detail: {
                    componentName: 'strandstestlwcv1',
                    errorMessage: this.errorMessage,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            }));
        } finally {
            this.isLoading = false;
        }
    }

    @api
    refreshData() {
        if (this.abnNumber) {
            this.handleLookup();
        }
    }

    @api
    validateComponent() {
        return this.abnNumber && this.abnNumber.trim() !== '';
    }
}