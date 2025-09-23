import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getClaims from '@salesforce/apex/NZACCClaimsController.getClaims';
import searchClaims from '@salesforce/apex/NZACCClaimsController.searchClaims';
import deleteClaim from '@salesforce/apex/NZACCClaimsController.deleteClaim';

export default class NZACCClaims extends LightningElement {
    // Reactive Properties
    @track claims = [];
    @track isModalOpen = false;
    @track showToast = false;
    @track currentRecordId;
    @track selectedStatus = 'All';
    @track sortedBy;
    @track sortedDirection = 'asc';
    @track searchTerm = '';

    // Toast Properties
    @track toastMessage = '';
    @track toastVariant = 'success';

    // Non-reactive properties
    columns = [
        { label: 'Claim Number', fieldName: 'Claim_Number__c', type: 'text', sortable: true },
        { label: 'Claimant Name', fieldName: 'Claimant_Name__c', type: 'text', sortable: true },
        { label: 'Injury Type', fieldName: 'Injury_Type__c', type: 'text', sortable: true },
        { label: 'Incident Date', fieldName: 'Incident_Date__c', type: 'date', sortable: true },
        { label: 'Status', fieldName: 'Status__c', type: 'text', sortable: true },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    statusOptions = [
        { label: 'All', value: 'All' },
        { label: 'New', value: 'New' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Declined', value: 'Declined' }
    ];

    // Getters
    get modalTitle() {
        return this.currentRecordId ? 'Edit ACC Claim' : 'New ACC Claim';
    }

    get toastClass() {
        return `slds-notify slds-notify_toast slds-theme_${this.toastVariant}`;
    }

    get toastIcon() {
        return `utility:${this.toastVariant === 'success' ? 'success' : 'error'}`;
    }

    // Lifecycle Hooks
    connectedCallback() {
        this.loadClaims();
    }

    // Data Loading
    loadClaims() {
        getClaims()
            .then(result => {
                this.claims = result;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.showNotification('Error loading claims', 'error');
            });
    }

    // Event Handlers
    handleNewClaim() {
        this.currentRecordId = null;
        this.isModalOpen = true;
    }

    handleRefresh() {
        this.loadClaims();
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
        searchClaims({ searchTerm: this.searchTerm, status: this.selectedStatus })
            .then(result => {
                this.claims = result;
            })
            .catch(error => {
                this.showNotification('Error searching claims', 'error');
            });
    }

    handleStatusFilter(event) {
        this.selectedStatus = event.detail.value;
        this.handleSearch({ target: { value: this.searchTerm }});
    }

    handleSort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        this.sortData(event.detail.fieldName, event.detail.sortDirection);
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
            case 'edit':
                this.currentRecordId = row.Id;
                this.isModalOpen = true;
                break;
            case 'delete':
                this.handleDelete(row.Id);
                break;
            default:
                break;
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess() {
        this.isModalOpen = false;
        this.showNotification('Claim saved successfully', 'success');
        this.loadClaims();
    }

    handleError(event) {
        this.showNotification('Error saving claim', 'error');
    }

    handleDelete(recordId) {
        deleteClaim({ claimId: recordId })
            .then(() => {
                this.showNotification('Claim deleted successfully', 'success');
                this.loadClaims();
            })
            .catch(error => {
                this.showNotification('Error deleting claim', 'error');
            });
    }

    handleSave() {
        this.template.querySelector('lightning-record-edit-form').submit();
    }

    // UI Handlers
    closeModal() {
        this.isModalOpen = false;
    }

    showNotification(message, variant) {
        this.toastMessage = message;
        this.toastVariant = variant;
        this.showToast = true;
        setTimeout(() => {
            this.closeToast();
        }, 3000);
    }

    closeToast() {
        this.showToast = false;
    }

    // Utility Methods
    sortData(fieldName, direction) {
        const parseData = JSON.parse(JSON.stringify(this.claims));
        const reverse = direction === 'asc' ? 1 : -1;

        parseData.sort((a, b) => {
            let fa = a[fieldName] ? a[fieldName].toLowerCase() : '';
            let fb = b[fieldName] ? b[fieldName].toLowerCase() : '';
            
            if (fa < fb) return -1 * reverse;
            if (fa > fb) return 1 * reverse;
            return 0;
        });

        this.claims = parseData;
    }
}