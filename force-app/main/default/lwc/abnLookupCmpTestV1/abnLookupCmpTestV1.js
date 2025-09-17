import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnLookupCmpTestV1Controller.search';

const MINIMAL_SEARCH_TERM_LENGTH = 2;
const SEARCH_DELAY = 300;

export default class AbnLookupCmpTestV1 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api objectApiName = 'Account';
    @api fields = ['Name', 'Type'];
    @api searchField = 'Name';
    
    @track searchTerm = '';
    @track searchResults = [];
    @track selectedRecord = null;
    @track isLoading = false;
    
    searchThrottlingTimeout;
    
    get isExpanded() {
        return this.searchResults.length > 0 && !this.selectedRecord;
    }
    
    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }
    
    get noResults() {
        return !this.isLoading && this.searchResults.length === 0 && this.searchTerm.length >= MINIMAL_SEARCH_TERM_LENGTH;
    }
    
    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;
        
        // Clear any pending search timeout
        clearTimeout(this.searchThrottlingTimeout);
        
        // If search term is long enough, search
        if (searchTerm.length >= MINIMAL_SEARCH_TERM_LENGTH) {
            this.isLoading = true;
            
            // Throttle the search to prevent too many server calls
            this.searchThrottlingTimeout = setTimeout(() => {
                this.performSearch();
            }, SEARCH_DELAY);
        } else {
            this.searchResults = [];
        }
    }
    
    async performSearch() {
        try {
            const results = await search({
                objectApiName: this.objectApiName,
                searchTerm: this.searchTerm,
                searchField: this.searchField,
                fields: this.fields
            });
            
            this.searchResults = results.map(record => ({
                id: record.Id,
                name: record[this.searchField],
                type: record.Type || this.objectApiName
            }));
        } catch (error) {
            console.error('Search error:', error);
            this.dispatchEvent(
                new CustomEvent('error', {
                    detail: error.message
                })
            );
        } finally {
            this.isLoading = false;
        }
    }
    
    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.recordid;
        const selectedResult = this.searchResults.find(result => result.id === recordId);
        
        if (selectedResult) {
            this.selectedRecord = selectedResult;
            this.searchResults = [];
            this.dispatchEvent(
                new CustomEvent('select', {
                    detail: {
                        recordId: selectedResult.id,
                        record: selectedResult
                    }
                })
            );
        }
    }
    
    handleRemove() {
        this.selectedRecord = null;
        this.searchTerm = '';
        this.searchResults = [];
        this.dispatchEvent(
            new CustomEvent('clear')
        );
    }
    
    handleFocus() {
        if (this.searchTerm.length >= MINIMAL_SEARCH_TERM_LENGTH) {
            this.performSearch();
        }
    }
    
    handleBlur() {
        // Small timeout to allow click events to fire before closing dropdown
        setTimeout(() => {
            this.searchResults = [];
        }, 300);
    }
    
    @api
    clearSelection() {
        this.handleRemove();
    }
}