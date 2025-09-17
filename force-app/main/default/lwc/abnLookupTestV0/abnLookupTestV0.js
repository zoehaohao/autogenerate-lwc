import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnLookupTestV0Controller.search';

export default class AbnLookupTestV0 extends LightningElement {
    @api label = 'Search';
    @api iconName = 'standard:account';
    @api objectApiName = 'Account';
    @api searchField = 'Name';
    @api required = false;
    
    @track searchTerm = '';
    @track results = [];
    @track isLoading = false;
    @track error;
    
    handleKeyUp(event) {
        const searchValue = event.target.value;
        this.searchTerm = searchValue;
        
        if (searchValue.length >= 2) {
            this.isLoading = true;
            this.performSearch();
        } else {
            this.results = [];
        }
    }
    
    async performSearch() {
        try {
            const searchResults = await search({
                objectApiName: this.objectApiName,
                searchTerm: this.searchTerm,
                searchField: this.searchField
            });
            
            this.results = searchResults.map(record => ({
                id: record.Id,
                name: record[this.searchField],
                type: this.objectApiName
            }));
            
            this.error = undefined;
        } catch (error) {
            this.error = error.message;
            this.results = [];
        } finally {
            this.isLoading = false;
        }
    }
    
    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;
        
        const selectEvent = new CustomEvent('select', {
            detail: {
                id: selectedId,
                name: selectedName,
                type: this.objectApiName
            }
        });
        this.dispatchEvent(selectEvent);
        
        this.searchTerm = selectedName;
        this.results = [];
    }
    
    handleInputClick() {
        if (this.searchTerm.length >= 2) {
            this.performSearch();
        }
    }
    
    handleBlur() {
        // Using setTimeout to allow click events to fire on results first
        setTimeout(() => {
            this.results = [];
        }, 300);
    }
}