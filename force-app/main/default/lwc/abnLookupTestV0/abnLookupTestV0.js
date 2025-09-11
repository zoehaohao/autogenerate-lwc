import { LightningElement, api, track } from 'lwc';

export default class AbnLookupTestV0 extends LightningElement {
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @track searchTerm = '';
    @track results = [];
    @track isExpanded = false;

    get showResults() {
        return this.isExpanded && this.results.length > 0;
    }

    get computedComboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length >= 2) {
            // Mock results for testing
            this.results = [
                {
                    id: '1',
                    title: 'Test Result 1',
                    subtitle: 'Subtitle 1',
                    icon: this.iconName
                },
                {
                    id: '2',
                    title: 'Test Result 2',
                    subtitle: 'Subtitle 2',
                    icon: this.iconName
                }
            ];
            this.isExpanded = true;
        } else {
            this.results = [];
            this.isExpanded = false;
        }
    }

    handleSearchClick() {
        this.isExpanded = true;
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedResult = this.results.find(result => result.id === selectedId);
        
        if (selectedResult) {
            this.dispatchEvent(new CustomEvent('select', {
                detail: selectedResult
            }));
            
            this.searchTerm = selectedResult.title;
            this.isExpanded = false;
            this.results = [];
        }
    }

    @api
    clearSelection() {
        this.searchTerm = '';
        this.results = [];
        this.isExpanded = false;
    }
}