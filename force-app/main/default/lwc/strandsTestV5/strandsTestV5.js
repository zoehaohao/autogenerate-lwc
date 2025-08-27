import { LightningElement, api, track } from 'lwc';

export default class StrandsTestV5 extends LightningElement {
    @api recordId;
    @track abnNumber = '';
    @track abnData = null;

    get hasAbnData() {
        return this.abnData !== null;
    }

    handleAbnChange(event) {
        this.abnNumber = event.target.value;
        // In a real implementation, this would call an Apex method to fetch ABN data
        this.mockAbnLookup();
    }

    handleChangeField() {
        this.abnNumber = '';
        this.abnData = null;
    }

    // Mock method to simulate ABN lookup - in production, replace with actual API call
    mockAbnLookup() {
        if (this.abnNumber === '45 004 189 708') {
            this.abnData = {
                abn: '45 004 189 708',
                entityName: 'COLES SUPERMARKETS AUSTRALIA PTY LTD',
                activeFrom: '14 Feb 2000',
                entityType: 'Australian Private Company',
                gstRegisteredFrom: '01 Jul 2000',
                mainLocation: 'VIC 3123'
            };
        } else {
            this.abnData = null;
        }
    }
}