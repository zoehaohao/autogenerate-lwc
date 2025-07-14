import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnSearchTestController.searchABN';

export default class AbnSearchTest extends LightningElement {
    @track searchTerm = '';
    @track results = [];
    @track error = '';
    @track isLoading = false;

    get searchPlaceholder() {
        return 'Enter ABN (11 digits), ACN (9 digits) or Company Name';
    }

    get isSearchDisabled() {
        return !this.isValidInput || this.isLoading;
    }

    get hasResults() {
        return this.results && this.results.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.error && this.results && this.results.length === 0;
    }

    get isValidInput() {
        if (!this.searchTerm) return false;
        
        const term = this.searchTerm.trim();
        if (this.isABN(term)) return true;
        if (this.isACN(term)) return true;
        return term.length >= 2;
    }

    isABN(value) {
        return /^\d{11}$/.test(value);
    }

    isACN(value) {
        return /^\d{9}$/.test(value);
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.error = '';
    }

    handleKeyUp(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (!this.isValidInput) return;

        this.isLoading = true;
        this.error = '';
        this.results = [];

        try {
            const searchResults = await searchABN({ searchTerm: this.searchTerm.trim() });
            this.results = searchResults;
        } catch (error) {
            this.error = error.body?.message || 'An error occurred while searching. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }
}
