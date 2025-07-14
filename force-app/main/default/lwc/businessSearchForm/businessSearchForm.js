import { LightningElement, track } from 'lwc';
import searchBusiness from '@salesforce/apex/businessSearchFormController.searchBusiness';

export default class BusinessSearchForm extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = '';

    get hasError() {
        return this.errorMessage !== '';
    }

    get hasResults() {
        return this.searchResults.length > 0;
    }

    get isSearchDisabled() {
        return !this.isValidInput || this.isLoading;
    }

    get searchPlaceholder() {
        return 'Enter ABN (11 digits), ACN (9 digits) or Company Name';
    }

    get isValidInput() {
        if (!this.searchTerm) return false;
        
        if (this.searchType === 'ABN') {
            return /^\d{11}$/.test(this.searchTerm);
        } else if (this.searchType === 'ACN') {
            return /^\d{9}$/.test(this.searchTerm);
        } else {
            return this.searchTerm.length >= 2;
        }
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
    }

    detectSearchType() {
        if (/^\d{11}$/.test(this.searchTerm)) {
            this.searchType = 'ABN';
        } else if (/^\d{9}$/.test(this.searchTerm)) {
            this.searchType = 'ACN';
        } else {
            this.searchType = 'NAME';
        }
    }

    async handleSearch() {
        if (!this.isValidInput) return;

        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const results = await searchBusiness({
                searchTerm: this.searchTerm,
                searchType: this.searchType
            });
            
            if (results.success) {
                this.searchResults = results.data;
            } else {
                this.errorMessage = results.message;
            }
        } catch (error) {
            this.errorMessage = 'An error occurred while processing your request. Please try again.';
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
        }
    }
}
