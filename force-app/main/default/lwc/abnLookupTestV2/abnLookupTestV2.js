import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track errorMessage = '';
    @track isSearching = false;

    get searchPlaceholder() {
        return 'Enter ABN, ACN, or Company Name';
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isSearching && !this.errorMessage && this.searchTerm && !this.hasResults;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    handleKeyUp(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    validateSearch() {
        if (!this.searchTerm) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }

        const searchValue = this.searchTerm.trim();
        if (searchValue.length < 2) {
            this.errorMessage = 'Search term must be at least 2 characters';
            return false;
        }

        return true;
    }

    async handleSearch() {
        if (!this.validateSearch()) {
            return;
        }

        this.isSearching = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const results = await searchABN({ searchTerm: this.searchTerm });
            this.searchResults = results;
        } catch (error) {
            this.errorMessage = error.body?.message || 'An error occurred while searching. Please try again.';
        } finally {
            this.isSearching = false;
        }
    }
}
