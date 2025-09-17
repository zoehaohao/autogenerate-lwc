import { LightningElement, api, track } from 'lwc';

const DELAY = 300; // Debounce delay in milliseconds

export default class AbnLookupCmpTestV1 extends LightningElement {
    // Public properties
    @api label;
    @api placeholder = 'Search...';
    @api required = false;
    @api disabled = false;
    @api readonly = false;
    @api errorMessage;
    @api iconName = 'utility:search';
    @api minSearchLength = 2;

    // Private reactive properties
    @track searchTerm = '';
    @track results = [];
    @track showSpinner = false;
    @track hasFocus = false;
    @track selectedResult;

    // Private non-reactive properties
    _delayTimeout;

    // Computed properties
    get isExpanded() {
        return this.hasFocus && this.results.length > 0;
    }

    get noResults() {
        return this.hasFocus && this.results.length === 0 && !this.showSpinner && this.searchTerm.length >= this.minSearchLength;
    }

    get getContainerClass() {
        let baseClass = 'slds-combobox_container';
        return this.results.length > 0 && this.hasFocus ? 
            `${baseClass} slds-has-selection` : baseClass;
    }

    get getComboboxClass() {
        let baseClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        return this.isExpanded ? `${baseClass} slds-is-open` : baseClass;
    }

    get getListboxClass() {
        return `slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid ${this.isExpanded ? 'slds-show' : 'slds-hide'}`;
    }

    get getIconName() {
        return this.selectedResult ? 'utility:close' : this.iconName;
    }

    get getIconClass() {
        return `slds-input__icon ${this.showSpinner ? 'slds-hide' : ''}`;
    }

    get getIconAltText() {
        return this.selectedResult ? 'Clear Selection' : 'Search';
    }

    get getComboboxOptionClass() {
        return 'slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta';
    }

    // Event handlers
    handleKeyUp(event) {
        // Clear any previous timeout
        window.clearTimeout(this._delayTimeout);

        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        // Don't search if below minimum length
        if (searchTerm.length < this.minSearchLength) {
            this.results = [];
            return;
        }

        // Debounce the search
        this._delayTimeout = window.setTimeout(() => {
            this.showSpinner = true;
            this.performSearch(searchTerm);
        }, DELAY);
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
        
        this.selectedResult = {
            id: selectedId,
            value: selectedValue
        };

        this.searchTerm = selectedValue;
        this.results = [];

        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                id: selectedId,
                value: selectedValue
            }
        }));
    }

    // Public methods
    @api
    clearSelection() {
        this.selectedResult = null;
        this.searchTerm = '';
        this.results = [];
    }

    // Private methods
    performSearch(searchTerm) {
        // This is a mock implementation - replace with actual search logic
        const mockResults = [
            { id: '1', value: 'Result 1', subtitle: 'Subtitle 1', icon: 'standard:account' },
            { id: '2', value: 'Result 2', subtitle: 'Subtitle 2', icon: 'standard:account' }
        ];

        // Simulate API delay
        window.setTimeout(() => {
            this.results = mockResults.filter(result => 
                result.value.toLowerCase().includes(searchTerm.toLowerCase())
            );
            this.showSpinner = false;
        }, 500);
    }
}