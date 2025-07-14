import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';

    // Computed properties
    get searchPlaceholder() {
        switch (this.searchType) {
            case 'abn':
                return 'Enter 11-digit ABN number';
            case 'acn':
                return 'Enter 9-digit ACN number';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    get hasResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && this.searchResults.length === 0 && this.searchTerm;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (!this.validateInput()) {
            return;
        }

        this.isLoading = true;
        this.clearMessages();

        try {
            const result = await searchABN({
                searchTerm: this.searchTerm,
                searchType: this.searchType
            });

            if (result.success) {
                this.searchResults = result.data || [];
                this.dispatchSearchSuccess(result.data);
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.dispatchSearchError(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.dispatchSearchError(this.errorMessage);
        } finally {
            this.isLoading = false;
        }
    }

    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selectedResult = this.searchResults.find(result => result.id === selectedId);
        
        if (selectedResult) {
            this.dispatchSelectionEvent(selectedResult);
        }
    }

    // Helper methods
    detectSearchType() {
        const term = this.searchTerm.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(term)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(term)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }

    validateInput() {
        if (!this.searchTerm || this.searchTerm.trim().length < 2) {
            this.errorMessage = 'Please enter at least 2 characters to search';
            return false;
        }

        const term = this.searchTerm.replace(/\s/g, '');
        
        if (this.searchType === 'abn' && !/^\d{11}$/.test(term)) {
            this.errorMessage = 'ABN must be exactly 11 digits';
            return false;
        }
        
        if (this.searchType === 'acn' && !/^\d{9}$/.test(term)) {
            this.errorMessage = 'ACN must be exactly 9 digits';
            return false;
        }

        return true;
    }

    clearMessages() {
        this.errorMessage = '';
    }

    // Parent communication methods
    dispatchSearchSuccess(results) {
        const successEvent = new CustomEvent('searchsuccess', {
            detail: {
                componentName: 'abnLookupTestV2',
                results: results,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchSearchError(errorMessage) {
        const errorEvent = new CustomEvent('searcherror', {
            detail: {
                componentName: 'abnLookupTestV2',
                errorMessage: errorMessage,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('abnselected', {
            detail: {
                componentName: 'abnLookupTestV2',
                selectedABN: selectedResult,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectionEvent);
    }

    // Public API methods
    @api
    refreshData() {
        this.searchResults = [];
        this.clearMessages();
    }

    @api
    validateComponent() {
        return this.validateInput();
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.clearMessages();
    }
}
