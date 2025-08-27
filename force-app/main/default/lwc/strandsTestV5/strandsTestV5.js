import { LightningElement, api, track } from 'lwc';
import lookupABN from '@salesforce/apex/strandsTestV5Controller.lookupABN';

export default class StrandsTestV5 extends LightningElement {
    @api recordId;
    @track abnNumber = '';
    @track abnDetails;
    @track error;

    handleAbnChange(event) {
        this.abnNumber = event.target.value;
        this.error = null;
    }

    async handleLookup() {
        if (!this.validateABN()) {
            this.error = 'Please enter a valid 11-digit ABN number';
            return;
        }

        try {
            this.error = null;
            const result = await lookupABN({ abnNumber: this.abnNumber });
            if (result.success) {
                this.abnDetails = {
                    abn: result.data.abn,
                    entityName: result.data.entityName,
                    abnStatus: result.data.status,
                    entityType: result.data.entityType,
                    gstStatus: result.data.gstStatus,
                    location: result.data.location
                };
            } else {
                this.error = result.message || 'ABN lookup failed';
                this.abnDetails = null;
            }
        } catch (error) {
            this.error = error.message || 'An unexpected error occurred';
            this.abnDetails = null;
        }
    }

    validateABN() {
        return /^\d{11}$/.test(this.abnNumber);
    }
}