import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track errorMessage = '';
    
    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    handleSearch() {
        if (!this.searchTerm) {
            this.errorMessage = 'Please enter a search term';
            return;
        }

        // Reset error and results
        this.errorMessage = '';
        this.searchResults = [];

        // Call Apex method
        searchABN({ searchTerm: this.searchTerm })
            .then(result => {
                if (result.success) {
                    this.searchResults = result.data;
                    if (this.searchResults.length === 0) {
                        this.errorMessage = 'No results found';
                    }
                } else {
                    this.errorMessage = result.message || 'An error occurred while searching';
                }
            })
            .catch(error => {
                this.errorMessage = error.body?.message || 'An unexpected error occurred';
                console.error('Error:', error);
            });
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedResult = this.searchResults.find(result => result.id === selectedId);
        
        // Dispatch custom event with selected result
        this.dispatchEvent(new CustomEvent('selection', {
            detail: selectedResult
        }));
    }
}
