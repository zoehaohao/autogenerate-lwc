import { LightningElement, track } from 'lwc';

export default class StrandsTestV9 extends LightningElement {
    @track abnDetails;
    @track error;

    // Example data structure based on the image
    connectedCallback() {
        this.abnDetails = {
            abn: '45 004 189 708',
            entityName: 'COLES SUPERMARKETS AUSTRALIA PTY LTD',
            entityType: 'Australian Private Company',
            status: 'Active from 14 Feb 2000',
            gstRegistration: 'Registered from 01 Jul 2000',
            location: 'VIC 3123'
        };
    }

    // Method to handle errors
    handleError(error) {
        this.error = error.message;
        this.abnDetails = null;
    }
}