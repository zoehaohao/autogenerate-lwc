import { LightningElement, api, track } from 'lwc';

export default class AbnLookupCmpTestV0 extends LightningElement {
    @api label;
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api minSearchTermLength = 2;
    @api debounceDelay = 300;

    @track searchTerm = '';
    @track results = [];
    @track isLoading = false;
    @track hasFocus = false;

    _debounceTimer;

    get isExpanded() {
        return this.hasFocus && (this.results.length > 0 || this.isLoading);
    }

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        // Clear any existing timer
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }

        // If search term is long enough, trigger search
        if (searchTerm.length >= this.minSearchTermLength) {
            this._debounceTimer = setTimeout(() => {
                this.performSearch(searchTerm);
            }, this.debounceDelay);
        } else {
            this.results = [];
        }
    }

    handleFocus() {
        this.hasFocus = true;
        // Dispatch focus event
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleBlur() {
        // Use setTimeout to allow click events to fire before closing dropdown
        setTimeout(() => {
            this.hasFocus = false;
            // Dispatch blur event
            this.dispatchEvent(new CustomEvent('blur'));
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedValue = event.currentTarget.dataset.value;

        // Dispatch selection event
        this.dispatchEvent(
            new CustomEvent('selection', {
                detail: {
                    id: selectedId,
                    value: selectedValue
                }
            })
        );

        // Clear results and search term
        this.searchTerm = selectedValue;
        this.results = [];
    }

    async performSearch(searchTerm) {
        try {
            this.isLoading = true;
            
            // Mock search results - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.results = [
                { id: '1', value: 'Result 1', subtitle: 'Subtitle 1' },
                { id: '2', value: 'Result 2', subtitle: 'Subtitle 2' },
                { id: '3', value: 'Result 3', subtitle: 'Subtitle 3' }
            ];

        } catch (error) {
            console.error('Search error:', error);
            this.dispatchEvent(
                new CustomEvent('error', {
                    detail: error
                })
            );
        } finally {
            this.isLoading = false;
        }
    }

    @api
    clearSelection() {
        this.searchTerm = '';
        this.results = [];
    }
}