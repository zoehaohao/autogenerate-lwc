import { LightningElement, track } from 'lwc';
import searchBusinessEntities from '@salesforce/apex/strandsTestV11Controller.searchBusinessEntities';

export default class StrandsTestV11 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = '';

    get searchPlaceholder() {
        return 'Enter ABN (11 digits), ACN (9 digits) or Company Name';
    }

    get hasError() {
        return this.errorMessage !== '';
    }

    get hasResults() {
        return this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.hasError && this.searchTerm && !this.hasResults;
    }

    get isSearchDisabled() {
        return this.isLoading || !this.isValidSearchTerm;
    }

    get isValidSearchTerm() {
        if (!this.searchTerm || this.searchTerm.length < 2) return false;
        
        // Detect search type based on input
        if (this.searchTerm.match(/^\d{11}$/)) {
            this.searchType = 'ABN';
            return true;
        } else if (this.searchTerm.match(/^\d{9}$/)) {
            this.searchType = 'ACN';
            return true;
        } else if (this.searchTerm.length >= 2) {
            this.searchType = 'NAME';
            return true;
        }
        
        return false;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    async handleSearch() {
        if (!this.isValidSearchTerm) return;

        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const results = await searchBusinessEntities({
                searchTerm: this.searchTerm,
                searchType: this.searchType
            });

            if (Array.isArray(results)) {
                this.searchResults = results;
            } else {
                this.searchResults = [results];
            }
        } catch (error) {
            this.errorMessage = error.body?.message || 'An error occurred while searching. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }
}