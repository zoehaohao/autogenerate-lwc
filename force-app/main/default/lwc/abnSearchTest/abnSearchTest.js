import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnSearchTestController.searchABN';

const DEBOUNCE_DELAY = 300;
export default class AbnSearchTest extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track errorMessage = '';
    @track isLoading = false;

    get searchPlaceholder() {
        return 'Enter ABN (11 digits), ACN (9 digits) or Company Name';
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get isSearchDisabled() {
        return !this.isValidSearchTerm || this.isLoading;
    }

    get isValidSearchTerm() {
        if (!this.searchTerm) return false;
        
        // ABN validation
        if (/^\d{11}$/.test(this.searchTerm)) return true;
        
        // ACN validation
        if (/^\d{9}$/.test(this.searchTerm)) return true;
        
        // Company name validation
        return this.searchTerm.length >= 2;
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

    async handleSearch() {
        if (!this.isValidSearchTerm) return;

        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const results = await searchABN({ searchTerm: this.searchTerm });
            if (results.success) {
                this.searchResults = results.data;
                if (this.searchResults.length === 0) {
                    this.errorMessage = 'No results found';
                }
            } else {
                this.errorMessage = results.message || 'An error occurred while searching';
            }
        } catch (error) {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
        }
    }
}
