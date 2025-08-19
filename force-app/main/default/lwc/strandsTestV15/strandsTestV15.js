import { LightningElement, track } from 'lwc';
import searchBusinesses from '@salesforce/apex/strandsTestV15Controller.searchBusinesses';

export default class StrandsTestV15 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track errorMessage = '';
    @track isLoading = false;

    get searchPlaceholder() {
        return 'Enter ABN (11 digits), ACN (9 digits) or Company Name';
    }

    get isSearchDisabled() {
        return !this.isValidSearchTerm || this.isLoading;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.hasResults && this.searchTerm && !this.errorMessage;
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
        this.errorMessage = '';
    }

    async handleSearch() {
        if (!this.isValidSearchTerm) {
            this.errorMessage = 'Please enter a valid ABN, ACN or Company Name';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const results = await searchBusinesses({ searchTerm: this.searchTerm });
            this.searchResults = Array.isArray(results) ? results : [results];
        } catch (error) {
            this.errorMessage = error.body?.message || 'An error occurred while searching. Please try again.';
            this.searchResults = [];
        } finally {
            this.isLoading = false;
        }
    }
}