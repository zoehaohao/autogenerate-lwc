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
        // Validate search term
        if (!this.searchTerm || this.searchTerm.trim().length < 3) {
            this.errorMessage = 'Please enter at least 3 characters to search';
            this.searchResults = [];
            return;
        }

        // Call Apex method
        searchABN({ searchTerm: this.searchTerm })
            .then(result => {
                if (result.success) {
                    this.searchResults = result.data;
                    this.errorMessage = '';
                } else {
                    this.errorMessage = result.message || 'An error occurred while searching';
                    this.searchResults = [];
                }
            })
            .catch(error => {
                this.errorMessage = error.body?.message || 'An unexpected error occurred';
                this.searchResults = [];
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
