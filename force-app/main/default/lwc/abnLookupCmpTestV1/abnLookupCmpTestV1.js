import { LightningElement, api, track } from 'lwc';

export default class AbnLookupCmpTestV1 extends LightningElement {
    // Public properties
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api minSearchLength = 2;
    @api debounceTime = 300;
    @api required = false;

    // Private reactive properties
    @track searchTerm = '';
    @track results = [];
    @track loading = false;
    @track errorMessage = '';
    @track isExpanded = false;

    // Private non-reactive properties
    _debounceTimer;
    _selectedId;
    _selectedValue;

    // Computed properties
    get hasResults() {
        return this.results.length > 0;
    }

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${this.isExpanded ? 'slds-is-open' : ''}`;
    }

    get dropdownClass() {
        return `slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid ${this.isExpanded ? 'slds-show' : 'slds-hide'}`;
    }

    // Event handlers
    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        // Clear any existing timer
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }

        // If search term is empty, close dropdown and clear results
        if (!searchTerm) {
            this.clearResults();
            return;
        }

        // If search term is shorter than minimum length, show error
        if (searchTerm.length < this.minSearchLength) {
            this.errorMessage = `Please enter at least ${this.minSearchLength} characters`;
            this.clearResults();
            return;
        }

        // Clear error message
        this.errorMessage = '';

        // Set up debounced search
        this._debounceTimer = setTimeout(() => {
            this.performSearch(searchTerm);
        }, this.debounceTime);
    }

    handleFocus() {
        // Show dropdown if we have results
        if (this.hasResults) {
            this.isExpanded = true;
        }
    }

    handleBlur() {
        // Use setTimeout to allow click events to fire before closing
        setTimeout(() => {
            this.isExpanded = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedValue = event.currentTarget.dataset.value;
        
        this._selectedId = selectedId;
        this._selectedValue = selectedValue;
        this.searchTerm = selectedValue;
        this.isExpanded = false;

        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: {
                id: selectedId,
                value: selectedValue
            }
        }));
    }

    // Private methods
    clearResults() {
        this.results = [];
        this.isExpanded = false;
        this.loading = false;
    }

    performSearch(searchTerm) {
        // Show loading state
        this.loading = true;
        this.isExpanded = true;

        // Simulate API call - replace with actual API call
        setTimeout(() => {
            // Mock results
            this.results = [
                { id: '1', label: 'Result 1', value: 'Result 1', sublabel: 'Additional info 1' },
                { id: '2', label: 'Result 2', value: 'Result 2', sublabel: 'Additional info 2' },
                { id: '3', label: 'Result 3', value: 'Result 3', sublabel: 'Additional info 3' }
            ];
            this.loading = false;
        }, 1000);
    }

    // Public methods
    @api
    getValue() {
        return {
            id: this._selectedId,
            value: this._selectedValue
        };
    }

    @api
    reset() {
        this.searchTerm = '';
        this._selectedId = null;
        this._selectedValue = null;
        this.clearResults();
        this.errorMessage = '';
    }
}