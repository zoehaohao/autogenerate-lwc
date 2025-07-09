import { LightningElement, track } from 'lwc';

export default class AbnSearchTest extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track error = '';
    @track isLoading = false;

    get searchPlaceholder() {
        return 'Enter ABN (11 digits), ACN (9 digits) or Company Name';
    }

    get isSearchDisabled() {
        return !this.isValidSearchTerm || this.isLoading;
    }

    get hasResults() {
        return this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.error && this.searchResults.length === 0 && this.searchTerm;
    }

    get isValidSearchTerm() {
        if (!this.searchTerm) return false;
        
        // ABN validation (11 digits)
        if (/^\d{11}$/.test(this.searchTerm)) return true;
        
        // ACN validation (9 digits)
        if (/^\d{9}$/.test(this.searchTerm)) return true;
        
        // Company name validation (minimum 2 characters)
        if (this.searchTerm.length >= 2) return true;
        
        return false;
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
        if (!this.isValidSearchTerm) return;

        this.isLoading = true;
        this.error = '';
        this.searchResults = [];

        try {
            const results = await this.searchABN();
            this.searchResults = results;
        } catch (error) {
            this.error = error.message || 'An error occurred while searching. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }

    async searchABN() {
        const response = await fetch(`https://686dc140c9090c495387232f.mockapi.io/test/callouts/search_abn?search=${encodeURIComponent(this.searchTerm)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    }
}
