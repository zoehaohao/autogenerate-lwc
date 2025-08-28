import { LightningElement, api } from 'lwc';

export default class StrandsTestV5 extends LightningElement {
    @api recordId;

    // Sample data - in real implementation, these would be populated from an API call
    abn = '45 004 189 708';
    entityName = 'COLES SUPERMARKETS AUSTRALIA PTY LTD';
    entityType = 'Australian Private Company';
    gstStatus = 'Registered from 01 Jul 2000';
    businessLocation = 'VIC 3123';
    activeFrom = '14 Feb 2000';

    handleChangeField() {
        // Dispatch event to notify parent component
        this.dispatchEvent(new CustomEvent('changefield', {
            bubbles: true,
            composed: true,
            detail: {
                recordId: this.recordId
            }
        }));
    }
}