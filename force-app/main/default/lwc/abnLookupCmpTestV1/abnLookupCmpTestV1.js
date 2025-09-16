import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnLookupCmpTestV1Controller.search';

export default class AbnLookupCmpTestV1 extends LightningElement {
    @api objectName = 'Account'; // API property to specify which object to search
    @api iconName = 'standard:account'; // API property for the icon to display
    @api label = 'Search'; // API property for the input label
    @api placeholder = 'Search...'; // API property for the input placeholder
    
    @track searchTerm = '';
    @track searchResults = [];
    
    // Debouncing timeoutId
    delayTimeout;

    // Handle key up on the input field
    handleKeyUp(event) {
        // Clear any existing timeout
        window.clearTimeout(this.delayTimeout);
        
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;
        
        // If search term is empty, clear results
        if (searchTerm === '') {
            this.searchResults = [];
            return;
        }
        
        // Debounce the search to avoid too many server calls
        this.delayTimeout = setTimeout(() => {
            search({ searchTerm: searchTerm, objectName: this.objectName })
                .then(results => {
                    this.searchResults = results;
                })
                .catch(error => {
                    console.error('Error performing search:', error);
                    this.searchResults = [];
                });
        }, 300);
    }
    
    // Handle click on the input field
    handleClick() {
        // If there's a search term and no results showing, perform search
        if (this.searchTerm && this.searchResults.length === 0) {
            this.performSearch(this.searchTerm);
        }
    }
    
    // Handle selection of an item
    handleSelection(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;
        
        // Create and dispatch a custom event with the selected record details
        const selectEvent = new CustomEvent('select', {
            detail: {
                id: selectedId,
                name: selectedName,
                searchTerm: this.searchTerm
            }
        });
        this.dispatchEvent(selectEvent);
        
        // Clear the search results
        this.searchResults = [];
        this.searchTerm = selectedName;
    }
    
    // Helper method to perform the actual search
    performSearch(searchTerm) {
        search({ searchTerm: searchTerm, objectName: this.objectName })
            .then(results => {
                this.searchResults = results;
            })
            .catch(error => {
                console.error('Error performing search:', error);
                this.searchResults = [];
            });
    }
}