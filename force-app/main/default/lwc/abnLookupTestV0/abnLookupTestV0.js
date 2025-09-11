import { LightningElement, api, track } from 'lwc';

export default class AbnLookupTestV0 extends LightningElement {
    @api label = 'Search';
    @track searchTerm = '';
    @track results = [];
    @track isExpanded = false;

    get showResults() {
        return this.isExpanded && this.results.length > 0;
    }

    get showNoResults() {
        return this.isExpanded && this.results.length === 0 && this.searchTerm;
    }

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }

    get dropdownClass() {
        return `slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid`;
    }

    handleKeyUp(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length >= 2) {
            // Mock results for testing
            this.results = [
                { id: '1', label: 'Result 1', value: 'result1' },
                { id: '2', label: 'Result 2', value: 'result2' },
                { id: '3', label: 'Result 3', value: 'result3' }
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
        // Add delay to allow click event on results
        setTimeout(() => {
            this.isExpanded = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedValue = event.currentTarget.dataset.value;
        
        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: {
                id: selectedId,
                value: selectedValue
            }
        }));

        this.searchTerm = event.currentTarget.querySelector('.slds-listbox__option-text').textContent;
        this.isExpanded = false;
    }
}