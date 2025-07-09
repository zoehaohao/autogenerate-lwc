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

    validateSearch() {
        const term = this.searchTerm.trim();
        if (!term) {
            this.error = 'Please enter a search term';
            return false;
        }

        if (/^\d+$/.test(term)) {
            if (term.length === 11) {
                return true; // Valid ABN
            } else if (term.length === 9) {
                return true; // Valid ACN
            } else {
                this.error = 'Please enter a valid 11-digit ABN or 9-digit ACN';
                return false;
            }
        }

        if (term.length < 2) {
            this.error = 'Company name must be at least 2 characters';
            return false;
        }

        return true;
    }

    async handleSearch() {
        if (!this.validateSearch()) {
            return;
        }

        this.isLoading = true;
        this.error = null;
        this.searchResults = [];

        try {
            const results = await searchABN({ searchTerm: this.searchTerm });
            this.searchResults = results;
        } catch (error) {
            this.error = error.body?.message || 'An error occurred while searching. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }
}
