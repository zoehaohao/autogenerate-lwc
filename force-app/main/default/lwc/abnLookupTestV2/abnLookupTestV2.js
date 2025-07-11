import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track errorMessage = '';
    @track isSearching = false;

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    validateSearch() {
        if (!this.searchTerm || this.searchTerm.trim().length < 2) {
            this.errorMessage = 'Please enter at least 2 characters';
            return false;
        }
        return true;
    }

    async handleSearch() {
        if (!this.validateSearch()) return;

        this.isSearching = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const results = await searchABN({ searchTerm: this.searchTerm });
            if (results && results.length > 0) {
                this.searchResults = results;
            } else {
                this.errorMessage = `No matching results for ${this.searchTerm}, please check the inputs and try again.`;
            }
        } catch (error) {
            this.errorMessage = 'An error occurred while searching. Please try again.';
            console.error('Search error:', error);
        } finally {
            this.isSearching = false;
        }
    }
}
