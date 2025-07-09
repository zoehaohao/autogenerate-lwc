import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnSearchTestController.searchABN';

export default class AbnSearchTest extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track errorMessage = '';
    @track isLoading = false;

    get searchPlaceholder() {
        return 'Enter ABN (11 digits), ACN (9 digits) or Company Name';
    }

    get isSearchDisabled() {
        return !this.searchTerm || this.isLoading;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length === 0 && this.searchTerm;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    handleKeyPress(event) {
        if (event.keyCode === 13) {
            this.handleSearch();
        }
    }

    validateSearch() {
        if (!this.searchTerm) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }

        const term = this.searchTerm.trim();
        if (term.length < 2) {
            this.errorMessage = 'Search term must be at least 2 characters';
            return false;
        }

        // ABN validation
        if (/^\d+$/.test(term) && term.length === 11) {
            return true;
        }

        // ACN validation
        if (/^\d+$/.test(term) && term.length === 9) {
            return true;
        }

        // Company name validation
        if (term.length >= 2) {
            return true;
        }

        this.errorMessage = 'Invalid search format';
        return false;
    }

    async handleSearch() {
        if (!this.validateSearch()) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const results = await searchABN({ searchTerm: this.searchTerm });
            if (results.success) {
                this.searchResults = results.data;
            } else {
                this.errorMessage = results.message || 'Search failed. Please try again.';
            }
        } catch (error) {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
        }
    }
}
