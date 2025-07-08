import { LightningElement, api, track } from 'lwc';
import searchContacts from '@salesforce/apex/ContactSearchController.searchContactsByName';

export default class ContactSearchTest extends LightningElement {
    @api placeholder = 'Enter contact name...';
    @api maxResults = 50;
    @api showAccountName = true;

    @track searchTerm = '';
    @track contacts = [];
    @track isLoading = false;
    @track sortedBy;
    @track sortedDirection = 'asc';

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text', sortable: true },
        { label: 'Email', fieldName: 'Email', type: 'email', sortable: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', sortable: true },
        { label: 'Title', fieldName: 'Title', type: 'text', sortable: true }
    ];

    connectedCallback() {
        if (this.showAccountName) {
            this.columns.push({ 
                label: 'Account', 
                fieldName: 'AccountName', 
                type: 'text', 
                sortable: true 
            });
        }
    }

    get isSearchDisabled() {
        return !this.searchTerm || this.searchTerm.length < 2 || this.isLoading;
    }

    get hasResults() {
        return this.contacts.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && this.searchTerm && this.contacts.length === 0;
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

            this.dispatchSearchEvent();
        } catch (error) {
            console.error('Search error:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An error occurred while searching contacts',
                    variant: 'error'
                })
            );
        } finally {
            this.isLoading = false;
        }
    }

    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortDirection;
        this.sortData(sortedBy, sortDirection);
    }

    sortData(fieldName, direction) {
        const clonedData = [...this.contacts];
        clonedData.sort((a, b) => {
            return direction === 'asc' ? 
                this.compareValues(a[fieldName], b[fieldName]) :
                this.compareValues(b[fieldName], a[fieldName]);
        });
        this.contacts = clonedData;
    }

    compareValues(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
    }

    dispatchSearchEvent() {
        const searchEvent = new CustomEvent('contactsearch', {
            detail: {
                searchTerm: this.searchTerm,
                results: this.contacts,
                resultCount: this.contacts.length,
                timestamp: new Date()
            }
        });
        this.dispatchEvent(searchEvent);
    }

    @api
    clearResults() {
        this.contacts = [];
        this.searchTerm = '';
    }

    @api
    focusSearchInput() {
        const input = this.template.querySelector('.search-input');
        if (input) {
            input.focus();
        }
    }
}
