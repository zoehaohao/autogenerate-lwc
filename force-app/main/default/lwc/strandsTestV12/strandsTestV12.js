import { LightningElement, track } from 'lwc';
import searchBusinesses from '@salesforce/apex/strandsTestV12Controller.searchBusinesses';

const DEBOUNCE_DELAY = 300;
const SEARCH_TYPES = {
    ABN: 'ABN',
    ACN: 'ACN',
    NAME: 'Business Name'
};

export default class StrandsTestV12 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track errorMessage = '';
    @track isSearching = false;
    searchType = SEARCH_TYPES.NAME;
    
    get searchPlaceholder() {
        return `Search by ${this.searchType}`;
    }

    get hasResults() {
        return this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isSearching && !this.errorMessage && this.searchTerm && !this.hasResults;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType(this.searchTerm);
        this.errorMessage = '';
    }

    detectSearchType(value) {
        const abnRegex = /^\d{11}$/;
        const acnRegex = /^\d{9}$/;
        
        if (abnRegex.test(value)) {
            this.searchType = SEARCH_TYPES.ABN;
        } else if (acnRegex.test(value)) {
            this.searchType = SEARCH_TYPES.ACN;
        } else {
            this.searchType = SEARCH_TYPES.NAME;
        }
    }

    validateSearch() {
        if (!this.searchTerm) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }

        if (this.searchType === SEARCH_TYPES.NAME && this.searchTerm.length < 2) {
            this.errorMessage = 'Please enter at least 2 characters for business name search';
            return false;
        }

        return true;
    }

    async handleSearch() {
        if (!this.validateSearch()) {
            return;
        }

        this.isSearching = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const results = await searchBusinesses({ 
                searchTerm: this.searchTerm, 
                searchType: this.searchType 
            });
            
            if (results.success) {
                this.searchResults = results.data;
            } else {
                this.errorMessage = results.message || 'An error occurred while searching. Please try again.';
            }
        } catch (error) {
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
            console.error('Search error:', error);
        } finally {
            this.isSearching = false;
        }
    }
}