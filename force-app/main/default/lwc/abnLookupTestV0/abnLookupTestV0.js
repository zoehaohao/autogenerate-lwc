import { LightningElement, api } from 'lwc';

export default class AbnLookupTestV0 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    
    searchTerm = '';
    isExpanded = false;
    results = [];

    get showResults() {
        return this.isExpanded && this.results.length > 0;
    }

    get showNoResults() {
        return this.isExpanded && this.searchTerm && this.results.length === 0;
    }

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }

    handleKeyUp(event) {
        this.searchTerm = event.target.value;
        // Mock results for demonstration
        if (this.searchTerm) {
            this.results = [
                { id: '1', name: 'Result 1' },
                { id: '2', name: 'Result 2' },
                { id: '3', name: 'Result 3' }
            ].filter(result => 
                result.name.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        } else {
            this.results = [];
        }
    }

    handleFocus() {
        this.isExpanded = true;
    }

    handleBlur() {
        // Delay closing to allow click events to fire
        setTimeout(() => {
            this.isExpanded = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;
        
        this.searchTerm = selectedName;
        this.isExpanded = false;
        
        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: {
                id: selectedId,
                name: selectedName
            }
        }));
    }
}