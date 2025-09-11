import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AbnLookupTestV0 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api delay = 300;
    @api minSearchTermLength = 2;

    @track searchTerm = '';
    @track results = [];
    @track showResults = false;
    @track showNoResults = false;

    searchTimeoutId;

    // Handle key up event on input field
    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        // Clear any existing timeout
        window.clearTimeout(this.searchTimeoutId);

        // Don't search if term is too short
        if (searchTerm.length < this.minSearchTermLength) {
            this.showResults = false;
            return;
        }

        // Set timeout to prevent too many server calls
        this.searchTimeoutId = window.setTimeout(() => {
            this.performSearch(searchTerm);
        }, this.delay);
    }

    // Perform the actual search
    async performSearch(searchTerm) {
        try {
            // Mock results for testing - replace with actual API call
            this.results = [
                { id: '1', name: 'Test Account 1' },
                { id: '2', name: 'Test Account 2' },
                { id: '3', name: 'Test Account 3' }
            ];
            
            this.showResults = true;
            this.showNoResults = this.results.length === 0;

        } catch (error) {
            this.showError(error);
        }
    }

    // Handle result click
    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;

        // Dispatch custom event with selected record
        const selectEvent = new CustomEvent('select', {
            detail: {
                id: selectedId,
                name: selectedName
            }
        });
        this.dispatchEvent(selectEvent);

        // Clear results
        this.clearResults();
    }

    // Handle input focus
    handleFocus() {
        if (this.searchTerm.length >= this.minSearchTermLength) {
            this.showResults = true;
        }
    }

    // Handle input blur
    handleBlur() {
        // Use timeout to allow click event to fire before hiding results
        window.setTimeout(() => {
            this.showResults = false;
        }, 300);
    }

    // Clear results
    clearResults() {
        this.searchTerm = '';
        this.results = [];
        this.showResults = false;
        this.showNoResults = false;
    }

    // Show error toast
    showError(error) {
        const evt = new ShowToastEvent({
            title: 'Error',
            message: error.message || 'An error occurred during search',
            variant: 'error'
        });
        this.dispatchEvent(evt);
    }
}