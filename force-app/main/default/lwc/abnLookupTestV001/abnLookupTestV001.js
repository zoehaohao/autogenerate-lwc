import { LightningElement, api, track } from 'lwc';

export default class AbnLookupTestV001 extends LightningElement {
    @api label = 'Lookup Test';
    @api placeholder = 'Search...';
    @api minSearchTermLength = 2;
    
    @track searchTerm = '';
    @track results = [];
    @track isDropdownOpen = false;
    @track isLoading = false;

    get showResults() {
        return this.results.length > 0 && this.isDropdownOpen;
    }

    get noResults() {
        return this.results.length === 0 && this.isDropdownOpen && !this.isLoading;
    }

    get dropdownClass() {
        return `slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid ${this.isDropdownOpen ? 'slds-is-open' : ''}`;
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        if (searchTerm.length >= this.minSearchTermLength) {
            this.isLoading = true;
            this.performSearch(searchTerm);
        } else {
            this.results = [];
            this.isDropdownOpen = false;
        }
    }

    handleFocus() {
        if (this.searchTerm.length >= this.minSearchTermLength) {
            this.isDropdownOpen = true;
        }
    }

    handleBlur() {
        // Using setTimeout to allow click events to fire before closing dropdown
        setTimeout(() => {
            this.isDropdownOpen = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedResult = this.results.find(result => result.id === selectedId);
        
        if (selectedResult) {
            this.dispatchEvent(new CustomEvent('select', {
                detail: {
                    id: selectedResult.id,
                    name: selectedResult.name,
                    record: selectedResult
                }
            }));
            
            this.searchTerm = selectedResult.name;
            this.isDropdownOpen = false;
        }
    }

    performSearch(searchTerm) {
        // Mock search results - replace with actual API call
        const mockResults = [
            { id: '1', name: 'Test Result 1' },
            { id: '2', name: 'Test Result 2' },
            { id: '3', name: 'Test Result 3' }
        ];

        // Simulate API delay
        setTimeout(() => {
            this.results = mockResults.filter(result => 
                result.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            this.isLoading = false;
            this.isDropdownOpen = true;
        }, 300);
    }
}