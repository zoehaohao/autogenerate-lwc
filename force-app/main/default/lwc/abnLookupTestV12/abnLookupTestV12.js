import { LightningElement, api, track } from 'lwc';
import { debounce } from 'c/utils';

export default class AbnLookupTestV12 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api minSearchLength = 2;
    @api debounceDelay = 300;

    @track searchTerm = '';
    @track results = [];
    @track isExpanded = false;
    @track showSpinner = false;

    _debouncedSearch;

    connectedCallback() {
        this._debouncedSearch = debounce((searchTerm) => {
            this.performSearch(searchTerm);
        }, this.debounceDelay);
    }

    get computedClass() {
        const baseClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        return this.isExpanded ? `${baseClass} slds-is-open` : baseClass;
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        if (searchTerm.length >= this.minSearchLength) {
            this.showSpinner = true;
            this._debouncedSearch(searchTerm);
        } else {
            this.results = [];
            this.isExpanded = false;
        }
    }

    handleFocus() {
        if (this.searchTerm.length >= this.minSearchLength) {
            this.isExpanded = true;
        }
    }

    handleBlur() {
        // Using setTimeout to allow click events to fire before closing
        setTimeout(() => {
            this.isExpanded = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedValue = event.currentTarget.dataset.value;

        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                id: selectedId,
                value: selectedValue
            }
        }));

        this.searchTerm = selectedValue;
        this.isExpanded = false;
        this.results = [];
    }

    async performSearch(searchTerm) {
        try {
            // Mock API call - replace with actual search implementation
            const mockResults = [
                { id: '1', value: 'Result 1', subtitle: 'Subtitle 1' },
                { id: '2', value: 'Result 2', subtitle: 'Subtitle 2' },
                { id: '3', value: 'Result 3', subtitle: 'Subtitle 3' }
            ];

            this.results = mockResults;
            this.isExpanded = true;
        } catch (error) {
            console.error('Search error:', error);
            this.dispatchEvent(new CustomEvent('error', {
                detail: error
            }));
        } finally {
            this.showSpinner = false;
        }
    }
}