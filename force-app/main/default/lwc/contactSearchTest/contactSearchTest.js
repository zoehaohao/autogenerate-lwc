import { LightningElement, api, track } from 'lwc';
import searchContacts from '@salesforce/apex/ContactSearchTestController.searchContactsByName';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', type: 'text', sortable: true },
    { label: 'Email', fieldName: 'Email', type: 'email', sortable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', sortable: true },
    { label: 'Account Name', fieldName: 'AccountName', type: 'text', sortable: true },
    { label: 'Title', fieldName: 'Title', type: 'text', sortable: true }
];

export default class ContactSearchTest extends LightningElement {
    @api placeholder = 'Search by name...';
    @api maxResults = 50;
    @api showAccountName = true;

    @track searchTerm = '';
    @track contacts = [];
    @track isLoading = false;
    @track sortedBy = 'Name';
    @track sortedDirection = 'asc';

    columns = COLUMNS;

    get isSearchDisabled() {
        return !this.searchTerm || this.searchTerm.length < 2 || this.isLoading;
    }

    get hasResults() {
        return this.contacts.length > 0;
    }

    get showEmptyState() {
        return !this.isLoading && this.searchTerm && !this.hasResults;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    async handleSearch() {
        if (this.isSearchDisabled) return;

        this.isLoading = true;
        try {
            const results = await searchContacts({ 
                searchTerm: this.searchTerm,
                limitResults: this.maxResults
            });
            
            this.contacts = results.map(contact => ({
                ...contact,
                AccountName: contact.Account?.Name
            }));

            // Dispatch custom event
            this.dispatchEvent(new CustomEvent('contactsearch', {
                detail: {
                    searchTerm: this.searchTerm,
                    results: this.contacts,
                    resultCount: this.contacts.length,
                    timestamp: new Date()
                }
            }));
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.message,
                variant: 'error'
            }));
            this.contacts = [];
        } finally {
            this.isLoading = false;
        }
    }

    handleSort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        this.sortData();
    }

    sortData() {
        const reverse = this.sortedDirection === 'asc' ? 1 : -1;
        const fieldName = this.sortedBy;
        
        this.contacts = [...this.contacts.sort((a, b) => {
            a = a[fieldName] ? a[fieldName].toLowerCase() : '';
            b = b[fieldName] ? b[fieldName].toLowerCase() : '';
            return a > b ? 1 * reverse : -1 * reverse;
        })];
    }

    @api
    clearResults() {
        this.contacts = [];
        this.searchTerm = '';
    }

    @api
    focusSearchInput() {
        const input = this.template.querySelector('lightning-input');
        if (input) input.focus();
    }
}
