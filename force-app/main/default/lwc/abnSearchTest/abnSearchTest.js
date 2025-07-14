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

    get validationMessage() {
        if (!this.searchTerm) return '';
        
        const isABN = /^\d{11}$/.test(this.searchTerm);
        const isACN = /^\d{9}$/.test(this.searchTerm);
        const isName = this.searchTerm.length >= 2;

        if (!isABN && !isACN && !isName) {
            return 'Please enter a valid ABN (11 digits), ACN (9 digits) or Company Name (min 2 characters)';
        }
        return '';
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    async handleSearch() {
        if (!this.searchTerm) return;
        
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
