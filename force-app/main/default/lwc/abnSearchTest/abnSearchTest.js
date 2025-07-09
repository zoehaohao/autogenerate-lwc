import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnSearchTestController.searchABN';

export default class AbnSearchTest extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track errorMessage = '';
    @track isLoading = false;
    searchTimeout;

    get searchPlaceholder() {
        return 'Enter ABN (11 digits), ACN (9 digits) or Company Name';
    }

    get isSearchDisabled() {
        return !this.searchTerm || this.isLoading;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
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

    validateInput() {
        const term = this.searchTerm.trim();
        if (!term) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }

        if (/^\d+$/.test(term)) {
            if (term.length === 11) {
                return true; // Valid ABN
            } else if (term.length === 9) {
                return true; // Valid ACN
            } else {
                this.errorMessage = 'Invalid number format. ABN should be 11 digits, ACN should be 9 digits';
                return false;
            }
        }

        if (term.length < 2) {
            this.errorMessage = 'Company name must be at least 2 characters';
            return false;
        }

        return true;
    }

    handleSearch() {
        if (!this.validateInput()) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];

        // Clear any existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Debounce the search
        this.searchTimeout = setTimeout(() => {
            searchABN({ searchTerm: this.searchTerm })
                .then(result => {
                    if (result.success) {
                        this.searchResults = result.data;
                        if (!this.searchResults.length) {
                            this.errorMessage = 'No results found';
                        }
                    } else {
                        this.errorMessage = result.message || 'Search failed';
                    }
                })
                .catch(error => {
                    this.errorMessage = 'An error occurred while searching. Please try again.';
                    console.error('Search error:', error);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        }, 300);
    }
}
