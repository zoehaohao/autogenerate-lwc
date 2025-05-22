// quarterlyFinancialReport.js
import { LightningElement, track } from 'lwc';

export default class QuarterlyFinancialReport extends LightningElement {
    @track aboutText = 'Quarterly financial report details...';
    @track accountInfo = 'Account information...';

    openContactDetails(event) {
        event.preventDefault();
    }

    handleEdit() {
    }
}