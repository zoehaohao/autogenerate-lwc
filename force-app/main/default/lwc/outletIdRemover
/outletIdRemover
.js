// outletIdRemover.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class OutletIdRemover extends LightningElement {
    @track outlets = [];
    @track selectedRows = [];
    @track showConfirmDialog = false;
    @track showStatus = false;
    @track statusMessage = '';
    @track isProcessing = false;

    columns = [
        { label: 'Outlet Name', fieldName: 'name', type: 'text' },
        { label: 'Outlet ID', fieldName: 'outletId', type: 'text' },
        { label: 'Location', fieldName: 'location', type: 'text' },
        { label: 'Status', fieldName: 'status', type: 'text' }
    ];

    connectedCallback() {
        this.loadOutlets();
    }

    async loadOutlets() {
        try {
            // Simulated data - replace with actual API call
            this.outlets = [
                { id: '1', name: 'Outlet A', outletId: 'OUT001', location: 'Sydney', status: 'Active' },
                { id: '2', name: 'Outlet B', outletId: 'OUT002', location: 'Melbourne', status: 'Active' }
            ];
        } catch (error) {
            this.showToast('Error', 'Failed to load outlets', 'error');
        }
    }

    get selectedCount() {
        return this.selectedRows.length;
    }

    get isRemoveDisabled() {
        return this.selectedCount === 0 || this.isProcessing;
    }

    get statusClass() {
        return `slds-notify slds-notify_toast ${this.isProcessing ? 'slds-theme_info' : 'slds-theme_success'}`;
    }

    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }

    handleRemoveClick() {
        this.showConfirmDialog = true;
    }

    handleCancelConfirm() {
        this.showConfirmDialog = false;
    }

    async handleConfirmRemove() {
        this.showConfirmDialog = false;
        this.isProcessing = true;
        this.showStatus = true;
        this.statusMessage = 'Processing removal...';

        try {
            // Simulated API call - replace with actual implementation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showToast('Success', `Successfully removed ${this.selectedCount} outlet IDs`, 'success');
            this.selectedRows = [];
            await this.loadOutlets();
        } catch (error) {
            this.showToast('Error', 'Failed to remove outlet IDs', 'error');
        } finally {
            this.isProcessing = false;
            this.showStatus = false;
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}