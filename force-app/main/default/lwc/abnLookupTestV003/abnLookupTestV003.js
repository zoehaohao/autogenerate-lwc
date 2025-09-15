import { LightningElement, api, track } from 'lwc';

export default class AbnLookupTestV003 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api minSearchTermLength = 2;

    @track searchTerm = '';
    @track results = [];
    @track isExpanded = false;

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${this.isExpanded ? 'slds-is-open' : ''}`;
    }

    handleKeyUp(event) {
        this.searchTerm = event.target.value;
        
        // Only search if search term meets minimum length
        if (this.searchTerm.length >= this.minSearchTermLength) {
            // Mock results for testing
            this.results = [
                {
                    id: '1',
                    title: 'Test Result 1',
                    subtitle: 'Subtitle 1'
                },
                {
                    id: '2',
                    title: 'Test Result 2',
                    subtitle: 'Subtitle 2'
                },
                {
                    id: '3',
                    title: 'Test Result 3',
                    subtitle: 'Subtitle 3'
                }
            ];
            this.isExpanded = true;
        } else {
            this.results = [];
            this.isExpanded = false;
        }

        // Dispatch search event
        this.dispatchEvent(new CustomEvent('search', {
            detail: {
                searchTerm: this.searchTerm
            }
        }));
    }

    handleFocus() {
        if (this.results.length > 0) {
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
        const selectedResult = this.results.find(result => result.id === selectedId);
        
        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('select', {
            detail: selectedResult
        }));

        // Clear search and close dropdown
        this.searchTerm = selectedResult.title;
        this.results = [];
        this.isExpanded = false;
    }
}