import { LightningElement, track } from 'lwc';
import getAllClaims from '@salesforce/apex/NZACCClaimsv3Controller.getAllClaims';
import searchClaims from '@salesforce/apex/NZACCClaimsv3Controller.searchClaims';

export default class NZACCClaimsv3 extends LightningElement {
    @track claims = [];
    @track selectedStatus = '';
    @track sortedBy = 'claimNumber';
    @track sortedDirection = 'asc';
    searchTerm = '';

    columns = [
        { label: 'Claim Number', fieldName: 'claimNumber', type: 'text', sortable: true },
        { label: 'Status', fieldName: 'status', type: 'text', sortable: true },
        { label: 'Date Filed', fieldName: 'dateFiled', type: 'date', sortable: true },
        { label: 'Claimant Name', fieldName: 'claimantName', type: 'text', sortable: true },
        { label: 'Injury Type', fieldName: 'injuryType', type: 'text', sortable: true },
        { 
            label: 'Amount', 
            fieldName: 'amount', 
            type: 'currency', 
            sortable: true,
            typeAttributes: { currencyCode: 'NZD' } 
        }
    ];

    get statusOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'New', value: 'New' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Under Review', value: 'Under Review' },
            { label: 'Approved', value: 'Approved' },
            { label: 'Declined', value: 'Declined' }
        ];
    }

    connectedCallback() {
        this.loadClaims();
    }

    async loadClaims() {
        try {
            this.claims = await getAllClaims();
        } catch (error) {
            this.handleError(error);
        }
    }

    async handleSearchChange(event) {
        this.searchTerm = event.target.value;
        try {
            this.claims = await searchClaims({
                searchTerm: this.searchTerm,
                status: this.selectedStatus
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    async handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
        try {
            this.claims = await searchClaims({
                searchTerm: this.searchTerm,
                status: this.selectedStatus
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    handleSort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        this.sortData(this.sortedBy, this.sortedDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.claims));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1: -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.claims = parseData;
    }

    handleNewClaim() {
        // Navigate to new claim page or open modal
        // Implementation depends on business requirements
    }

    handleError(error) {
        // Show error toast or handle error appropriately
        console.error('Error:', error);
    }
}