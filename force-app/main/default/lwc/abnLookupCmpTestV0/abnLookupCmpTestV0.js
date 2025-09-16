import { LightningElement, api, track } from 'lwc';

export default class AbnLookupCmpTestV0 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api minSearchLength = 2;
    @api delay = 300;

    @track searchTerm = '';
    @track results = [];
    @track isExpanded = false;
    @track showResults = false;

    timeoutId;

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${this.showResults ? 'slds-is-open' : ''}`;
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        // Clear any pending timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // If search term is empty or too short, clear results
        if (!searchTerm || searchTerm.length < this.minSearchLength) {
            this.results = [];
            this.showResults = false;
            return;
        }

        // Set a timeout to prevent too many searches
        this.timeoutId = setTimeout(() => {
            this.performSearch();
        }, this.delay);
    }

    handleFocus() {
        this.isExpanded = true;
        if (this.results.length > 0) {
            this.showResults = true;
        }
    }

    handleBlur() {
        // Use setTimeout to allow click events to fire before closing
        setTimeout(() => {
            this.isExpanded = false;
            this.showResults = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedValue = event.currentTarget.dataset.value;
        
        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: {
                id: selectedId,
                value: selectedValue
            }
        }));

        // Clear search
        this.searchTerm = '';
        this.results = [];
        this.showResults = false;
    }

    performSearch() {
        // Mock search results - replace with actual search logic
        this.results = [
            { id: '1', label: 'Result 1', value: 'result1' },
            { id: '2', label: 'Result 2', value: 'result2' },
            { id: '3', label: 'Result 3', value: 'result3' }
        ];
        this.showResults = true;
    }
}