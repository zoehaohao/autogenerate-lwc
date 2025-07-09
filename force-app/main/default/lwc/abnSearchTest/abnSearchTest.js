import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnSearchTestController.searchABN';

export default class AbnSearchTest extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track error = null;
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
        return !this.isLoading && !this.error && this.searchResults && this.searchResults.length === 0;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.error = null;
    }

    handleKeyUp(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    validateInput() {
        const term = this.searchTerm.trim();
        if (!term) {
            this.error = 'Please enter a search term';
            return false;
        }

        // ABN validation (11 digits)
        if (/^\d+$/.test(term) && term.length === 11) {
            return true;
        }

        // ACN validation (9 digits)
        if (/^\d+$/.test(term) && term.length === 9) {
            return true;
        }

        // Company name validation (minimum 2 characters)
        if (term.length >= 2) {
            return true;
        }

        this.error = 'Please enter a valid ABN (11 digits), ACN (9 digits) or Company Name (min 2 characters)';
        return false;
    }

    async handleSearch() {
        if (!this.validateInput()) {
            return;
        }

        this.isLoading = true;
        this.error = null;
        this.searchResults = [];

        try {
            const results = await searchABN({ searchTerm: this.searchTerm.trim() });
            this.searchResults = results;
        } catch (error) {
            this.error = error.body?.message || 'An error occurred while searching. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }
}
