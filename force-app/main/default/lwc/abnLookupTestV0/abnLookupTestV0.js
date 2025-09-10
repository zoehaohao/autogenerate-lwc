import { LightningElement, api } from 'lwc';

const DELAY = 300;

export default class AbnLookupTestV0 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api minSearchTermLength = 2;

    searchTerm = '';
    results = [];
    showSpinner = false;
    isExpanded = false;
    delayTimeout;

    get getComboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }

    get getListboxClass() {
        return `slds-dropdown slds-dropdown_length-5 slds-dropdown_fluid`;
    }

    get noResults() {
        return !this.showSpinner && this.results.length === 0 && this.searchTerm.length >= this.minSearchTermLength;
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        if (this.delayTimeout) {
            clearTimeout(this.delayTimeout);
        }

        if (searchTerm.length >= this.minSearchTermLength) {
            this.showSpinner = true;
            this.isExpanded = true;

            this.delayTimeout = setTimeout(() => {
                // Simulate API call with mock data
                this.results = [
                    { id: '1', name: 'Test Account 1' },
                    { id: '2', name: 'Test Account 2' },
                    { id: '3', name: 'Test Account 3' }
                ].filter(item => 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                this.showSpinner = false;
            }, DELAY);
        } else {
            this.results = [];
            this.isExpanded = false;
        }
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;

        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                id: selectedId,
                name: selectedName
            }
        }));

        this.searchTerm = selectedName;
        this.isExpanded = false;
        this.results = [];
    }

    handleFocus() {
        if (this.searchTerm.length >= this.minSearchTermLength) {
            this.isExpanded = true;
        }
    }

    handleBlur() {
        // Add delay to allow click event on results
        setTimeout(() => {
            this.isExpanded = false;
        }, 300);
    }
}