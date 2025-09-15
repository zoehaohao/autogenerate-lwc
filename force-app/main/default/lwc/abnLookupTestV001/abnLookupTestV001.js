import { LightningElement, api, track } from 'lwc';

export default class AbnLookupTestV001 extends LightningElement {
    @api placeholder = 'Search...';
    @api label = 'Search';
    @api required = false;
    @api messageWhenInvalid = 'Please select a valid option';
    @api minSearchTermLength = 2;
    @api delay = 300;

    @track searchTerm = '';
    @track results = [];
    @track showSpinner = false;
    @track hasFocus = false;
    @track selectedValue;
    @track selectedLabel;

    _timeoutId;

    get getContainerClass() {
        let css = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        if (this.hasFocus && this.isSearching) {
            css += ' slds-is-open';
        }
        return css;
    }

    get isSearching() {
        return this.searchTerm && this.searchTerm.length >= this.minSearchTermLength;
    }

    get noResults() {
        return this.isSearching && this.results.length === 0 && !this.showSpinner;
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        // Clear any existing timeout
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }

        // If search term is long enough, set timeout for search
        if (searchTerm.length >= this.minSearchTermLength) {
            this.showSpinner = true;
            this._timeoutId = setTimeout(() => {
                this.performSearch();
            }, this.delay);
        } else {
            this.results = [];
        }
    }

    handleChange(event) {
        this.searchTerm = event.target.value;
    }

    handleFocus() {
        this.hasFocus = true;
    }

    handleBlur() {
        // Delay hiding the dropdown to allow click events to fire
        setTimeout(() => {
            this.hasFocus = false;
        }, 300);
    }

    handleClick() {
        if (this.searchTerm.length >= this.minSearchTermLength) {
            this.hasFocus = true;
        }
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedValue = event.currentTarget.dataset.value;
        const selectedResult = this.results.find(result => result.id === selectedId);

        if (selectedResult) {
            this.selectedValue = selectedValue;
            this.selectedLabel = selectedResult.label;
            this.searchTerm = selectedResult.label;
            this.results = [];
            this.hasFocus = false;

            // Dispatch selection event
            this.dispatchEvent(new CustomEvent('selection', {
                detail: {
                    id: selectedId,
                    value: selectedValue,
                    label: selectedResult.label
                }
            }));
        }
    }

    @api
    clearSelection() {
        this.selectedValue = null;
        this.selectedLabel = null;
        this.searchTerm = '';
        this.results = [];
    }

    performSearch() {
        // Mock search results - replace with actual search implementation
        this.results = [
            { id: '1', value: 'option1', label: 'First Option' },
            { id: '2', value: 'option2', label: 'Second Option' },
            { id: '3', value: 'option3', label: 'Third Option' }
        ];
        this.showSpinner = false;
    }
}