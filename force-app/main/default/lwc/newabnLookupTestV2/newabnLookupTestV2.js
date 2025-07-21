import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newabnLookupTestV2Controller.searchABN';

export default class NewabnLookupTestV2 extends LightningElement {
    @api headerTitle = 'Find ABN';
    @track searchTerm = '';
    @track searchResults = [];
    @track errorMessage = '';
    @track isSearching = false;
    
    get searchInstructions() {
        return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
    }

    get searchPlaceholder() {
        return 'Search by Business name, ABN or ACN';
    }

    get buttonLabel() {
        return this.isSearching ? 'Searching...' : 'Search';
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    async handleSearch() {
        if (!this.searchTerm || this.searchTerm.trim().length < 2) {
            this.errorMessage = 'Please enter at least 2 characters to search';
            return;
        }

        this.isSearching = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const results = await searchABN({ searchTerm: this.searchTerm });
            if (results.success) {
                this.searchResults = results.data;
                if (this.searchResults.length === 0) {
                    this.errorMessage = `No matching results for ${this.searchTerm}, please check the inputs and try again.`;
                }
            } else {
                this.errorMessage = results.message || 'An error occurred while searching';
            }
        } catch (error) {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            console.error('Search error:', error);
        } finally {
            this.isSearching = false;
        }
    }

    handleSelect(event) {
        const selectedAbn = event.currentTarget.dataset.abn;
        const selectedResult = this.searchResults.find(result => 
            result.abn.identifier_value === selectedAbn
        );

        this.dispatchEvent(new CustomEvent('abnselected', {
            detail: {
                abn: selectedAbn,
                entityDetails: selectedResult
            }
        }));
    }
}
