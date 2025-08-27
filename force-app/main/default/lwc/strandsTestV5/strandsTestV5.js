import { LightningElement, api, track } from 'lwc';

export default class StrandsTestV5 extends LightningElement {
    @track abn = '45 004 189 708';
    @track entityName = 'COLES SUPERMARKETS AUSTRALIA PTY LTD';
    @track activeFromDate = '14 Feb 2000';
    @track entityType = 'Australian Private Company';
    @track gstStatus = 'Registered';
    @track gstDate = '01 Jul 2000';
    @track businessLocation = 'VIC 3123';

    handleChangeField() {
        // Handle change field button click
        // This would typically open a modal or navigate to a new page
        this.dispatchEvent(new CustomEvent('changefield', {
            bubbles: true,
            composed: true,
            detail: {
                currentAbn: this.abn
            }
        }));
    }

    // Method to update ABN details
    @api
    updateAbnDetails(abnDetails) {
        if (abnDetails) {
            this.abn = abnDetails.abn || this.abn;
            this.entityName = abnDetails.entityName || this.entityName;
            this.activeFromDate = abnDetails.activeFromDate || this.activeFromDate;
            this.entityType = abnDetails.entityType || this.entityType;
            this.gstStatus = abnDetails.gstStatus || this.gstStatus;
            this.gstDate = abnDetails.gstDate || this.gstDate;
            this.businessLocation = abnDetails.businessLocation || this.businessLocation;
        }
    }
}