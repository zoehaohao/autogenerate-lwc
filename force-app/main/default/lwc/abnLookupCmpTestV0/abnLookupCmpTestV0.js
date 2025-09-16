import { LightningElement, api, track } from 'lwc';

export default class AbnLookupCmpTestV0 extends LightningElement {
    // Public properties
    @api label = '';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api required = false;
    @api disabled = false;
    @api readonly = false;
    @api minSearchLength = 2;
    @api debounceTime = 300;

    // Private reactive properties
    @track searchTerm = '';
    @track results = [];
    @track errorMessage = '';
    @track isSearching = false;
    @track hasFocus = false;

    // Private non-reactive properties
    searchTimeout;
    selectedId;
    selectedValue;

    // Computed properties
    get hasResults() {
        return this.results && this.results.length > 0;
    }

    get showResults() {
        return this.hasFocus && (this.hasResults || this.isSearching);
    }

    get isExpanded() {
        return this.showResults ? 'true' : 'false';
    }

    get getContainerClass() {
        let baseClass = 'slds-combobox_container';
        if (this.selectedId) {
            baseClass += ' slds-has-selection';
        }
        return baseClass;
    }

    get getComboboxClass() {
        let baseClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        if (this.showResults) {
            baseClass += ' slds-is-open';
        }
        return baseClass;
    }

    // Event handlers
    handleKeyUp(event) {
        // Debounce search
        window.clearTimeout(this.searchTimeout);
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        if (searchTerm.length >= this.minSearchLength) {
            this.isSearching = true;
            this.searchTimeout = window.setTimeout(() => {
                this.performSearch(searchTerm);
            }, this.debounceTime);
        } else {
            this.results = [];
            this.isSearching = false;
        }
    }

    handleFocus() {
        this.hasFocus = true;
    }

    handleBlur() {
        // Delay hiding results to allow click events to fire
        window.setTimeout(() => {
            this.hasFocus = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedValue = event.currentTarget.dataset.value;
        this.selectResult(selectedId, selectedValue);
    }

    // Private methods
    performSearch(searchTerm) {
        // Mock search results - replace with actual search logic
        this.results = [
            { id: '1', label: 'Result 1', value: 'value1', sublabel: 'Sub Label 1' },
            { id: '2', label: 'Result 2', value: 'value2', sublabel: 'Sub Label 2' }
        ];
        this.isSearching = false;
    }

    selectResult(id, value) {
        this.selectedId = id;
        this.selectedValue = value;
        this.searchTerm = this.results.find(result => result.id === id)?.label || '';
        this.results = [];
        
        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                id: this.selectedId,
                value: this.selectedValue
            }
        }));
    }

    @api
    clearSelection() {
        this.selectedId = null;
        this.selectedValue = null;
        this.searchTerm = '';
        this.results = [];
    }
}