import { LightningElement, api, track } from 'lwc';

export default class AbnLookupTestV002 extends LightningElement {
    // Public properties
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api required = false;
    @api disabled = false;
    @api minSearchTermLength = 2;
    @api debounceDelay = 300;
    @api errorMessage = '';

    // Private reactive properties
    @track searchTerm = '';
    @track results = [];
    @track isSearching = false;
    @track hasFocus = false;
    @track selectedItem = null;

    // Debouncing timeout
    searchTimeout;

    // Computed properties
    get hasError() {
        return !!this.errorMessage;
    }

    get hasResults() {
        return this.results.length > 0;
    }

    get showResults() {
        return this.hasFocus && (this.hasResults || this.isSearching);
    }

    get isExpanded() {
        return this.showResults.toString();
    }

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.showResults ? 'slds-is-open' : ''
        }`;
    }

    get inputClass() {
        return `slds-input slds-combobox__input ${
            this.hasError ? 'slds-has-error' : ''
        }`;
    }

    get getIconName() {
        return this.isSearching ? 'utility:spinner' : 'utility:search';
    }

    get getIconClass() {
        return `slds-icon-text-default ${
            this.isSearching ? 'slds-is-animated' : ''
        }`;
    }

    // Event handlers
    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        // Clear any pending search timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // If search term is empty, clear results
        if (!searchTerm) {
            this.results = [];
            return;
        }

        // If search term is too short, show error
        if (searchTerm.length < this.minSearchTermLength) {
            this.errorMessage = `Please enter at least ${this.minSearchTermLength} characters`;
            return;
        }

        // Clear error message
        this.errorMessage = '';

        // Debounce the search
        this.searchTimeout = setTimeout(() => {
            this.performSearch(searchTerm);
        }, this.debounceDelay);
    }

    handleFocus() {
        this.hasFocus = true;
    }

    handleBlur() {
        // Delay hiding results to allow click events to fire
        setTimeout(() => {
            this.hasFocus = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedValue = event.currentTarget.dataset.value;
        
        this.selectedItem = this.results.find(result => result.id === selectedId);
        this.searchTerm = this.selectedItem.label;
        this.results = [];

        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: {
                id: selectedId,
                value: selectedValue,
                record: this.selectedItem
            }
        }));
    }

    // Search implementation
    async performSearch(searchTerm) {
        try {
            this.isSearching = true;

            // TODO: Implement actual search logic here
            // This is a mock implementation
            this.results = [
                { id: '1', label: 'Result 1', sublabel: 'Sublabel 1', value: 'value1' },
                { id: '2', label: 'Result 2', sublabel: 'Sublabel 2', value: 'value2' },
                { id: '3', label: 'Result 3', sublabel: 'Sublabel 3', value: 'value3' }
            ];

            this.isSearching = false;
        } catch (error) {
            this.errorMessage = 'An error occurred while searching';
            this.isSearching = false;
            console.error('Search error:', error);
        }
    }

    // Public methods
    @api
    clearSelection() {
        this.searchTerm = '';
        this.selectedItem = null;
        this.results = [];
    }

    @api
    setSearchTerm(term) {
        this.searchTerm = term;
        if (term && term.length >= this.minSearchTermLength) {
            this.performSearch(term);
        }
    }
}