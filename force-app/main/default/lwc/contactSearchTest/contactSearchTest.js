// contactSearchTest.js
import { LightningElement, api, track } from 'lwc';
import searchContactsByName from '@salesforce/apex/ContactSearchTestController.searchContactsByName';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', type: 'text', sortable: true },
    { label: 'Email', fieldName: 'Email', type: 'email', sortable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', sortable: true },
    { label: 'Account', fieldName: 'AccountName', type: 'text', sortable: true },
    { label: 'Title', fieldName: 'Title', type: 'text', sortable: true }
];

export default class ContactSearchTest extends LightningElement {
    @api placeholder = 'Enter contact name...';
    @api maxResults = 50;
    @api showAccountName = true;

    @track searchTerm = '';
    @track contacts = [];
    @track isLoading = false;
    @track sortedBy;
    @track sortedDirection = 'asc';

    columns = COLUMNS;

    get isSearchDisabled() {
        return !this.searchTerm || this.searchTerm.length < 2 || this.isLoading;
    }

    get hasResults() {
        return this.contacts && this.contacts.length > 0;
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
    }

    async handleSearch() {
        if (this.isSearchDisabled) return;

        this.isLoading = true;
        try {
            const results = await searchContactsByName({
                searchTerm: this.searchTerm,
                limitResults: this.maxResults
            });
            
            this.contacts = results.map(contact => ({
                ...contact,
                AccountName: contact.Account?.Name
            }));

            this.dispatchSearchEvent();
        } catch (error) {
            console.error('Error searching contacts:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.message,
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
            const aValue = a[fieldName] || '';
            const bValue = b[fieldName] || '';
            return direction === 'asc' ? 
                aValue.localeCompare(bValue) : 
                bValue.localeCompare(aValue);
        });
        this.contacts = clonedData;
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
        const searchInput = this.template.querySelector('lightning-input');
        if (searchInput) {
            searchInput.focus();
        }
    }
}
