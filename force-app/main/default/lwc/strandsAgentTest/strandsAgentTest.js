import { LightningElement, track } from 'lwc';

export default class StrandsAgentTest extends LightningElement {
    @track contactName = 'Mr test name sep name';
    @track position = 'Manager';
    @track phone = '0456456654';
    @track email = 'test30sep@health.gov.au';

    handleEdit() {
        // Handle edit functionality
        // This would typically open a modal or navigate to an edit page
        console.log('Edit button clicked');
    }
}