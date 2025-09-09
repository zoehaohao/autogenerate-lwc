import { LightningElement, api, track } from 'lwc';

export default class AbnLookupTestV12 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    
    @track searchTerm = '';
    @track results = [];
    @track isExpanded = false;

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }

    get noResults() {
        return this.isExpanded && this.results.length === 0;
    }

    handleKeyUp(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length >= 2) {
            // Mock results for testing
            this.results = [
                { id: '1', name: 'Result 1' },
                { id: '2', name: 'Result 2' },
                { id: '3', name: 'Result 3' }
            ];
            this.isExpanded = true;
        } else {
            this.results = [];
            this.isExpanded = false;
        }
    }

    handleFocus() {
        if (this.searchTerm.length >= 2) {
            this.isExpanded = true;
        }
    }

    handleBlur() {
        // Add delay to allow click events to fire on results
        setTimeout(() => {
            this.isExpanded = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedResult = this.results.find(result => result.id === selectedId);
        if (selectedResult) {
            this.searchTerm = selectedResult.name;
            this.isExpanded = false;
            this.dispatchEvent(new CustomEvent('select', {
                detail: selectedResult
            }));
        }
    }
}