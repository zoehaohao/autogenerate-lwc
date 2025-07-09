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

    get hasResults() {
        return this.searchResults.length > 0;
    }

    get hasError() {
        return this.errorMessage !== '';
    }

    get isSearchDisabled() {
        return !this.isValidInput() || this.isLoading;
    }

    get showNoResults() {
        return !this.isLoading && !this.hasError && !this.hasResults && this.searchTerm;
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

    isValidInput() {
        const term = this.searchTerm.trim();
        if (!term) return false;
        
        // ABN validation (11 digits)
        if (/^\d{11}$/.test(term)) return true;
        
        // ACN validation (9 digits)
        if (/^\d{9}$/.test(term)) return true;
        
        // Company name validation (minimum 2 characters)
        return term.length >= 2;
    }

    async handleSearch() {
        if (!this.isValidInput()) {
            this.errorMessage = 'Please enter a valid ABN, ACN or Company Name';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const results = await searchABN({ searchTerm: this.searchTerm.trim() });
            this.searchResults = results;
        } catch (error) {
            this.errorMessage = error.body?.message || 'An error occurred while searching. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }
}
