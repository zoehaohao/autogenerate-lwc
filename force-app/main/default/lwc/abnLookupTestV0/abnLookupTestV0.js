import { LightningElement, api, track } from 'lwc';

export default class AbnLookupTestV0 extends LightningElement {
    @api label = 'Search';
    @api iconName = 'standard:account';
    @api placeholder = 'Search...';
    
    @track searchTerm = '';
    @track results = [];
    @track isDropdownOpen = false;

    handleKeyUp(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length >= 2) {
            // Mock results for testing
            this.results = [
                { id: '1', name: 'Test Result 1' },
                { id: '2', name: 'Test Result 2' },
                { id: '3', name: 'Test Result 3' }
            ];
            this.isDropdownOpen = true;
        } else {
            this.results = [];
            this.isDropdownOpen = false;
        }
    }

    handleFocus() {
        if (this.searchTerm.length >= 2) {
            this.isDropdownOpen = true;
        }
    }

    handleBlur() {
        // Add small delay to allow click events to fire on results
        setTimeout(() => {
            this.isDropdownOpen = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedResult = this.results.find(result => result.id === selectedId);
        
        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: {
                id: selectedResult.id,
                name: selectedResult.name
            }
        }));

        this.searchTerm = selectedResult.name;
        this.isDropdownOpen = false;
    }

    @api
    clearSelection() {
        this.searchTerm = '';
        this.results = [];
        this.isDropdownOpen = false;
    }
}