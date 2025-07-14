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
    @track validationError = '';
    @track searchType = '';
    @track hasSearched = false;

    // Getters for dynamic properties
    get searchPlaceholder() {
        switch (this.searchType) {
            case 'ABN':
                return 'Enter 11-digit ABN number';
            case 'ACN':
                return 'Enter 9-digit ACN number';
            case 'NAME':
                return 'Enter company name (minimum 2 characters)';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchButtonLabel() {
        return this.searchType === 'ABN' ? 'Verify' : 'Search';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.validationError;
    }

    get hasResults() {
        return !this.isLoading && this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && this.hasSearched && (!this.searchResults || this.searchResults.length === 0) && !this.errorMessage;
    }

    get resultsCount() {
        return this.searchResults ? this.searchResults.length : 0;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.validateInput();
        this.clearPreviousResults();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13 && !this.isSearchDisabled) {
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (this.isSearchDisabled) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.hasSearched = true;

        try {
            const result = await searchABN({
                searchTerm: this.searchTerm,
                searchType: this.searchType
            });

            if (result.success) {
                this.searchResults = result.data || [];
                this.dispatchSearchSuccessEvent();
            } else {
                this.errorMessage = result.message || 'An error occurred while searching';
                this.searchResults = [];
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.searchResults = [];
            this.dispatchErrorEvent(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    handleSelectResult(event) {
        const recordId = event.target.dataset.recordId;
        const selectedResult = this.searchResults.find(result => result.id === recordId);
        
        if (selectedResult) {
            this.dispatchSelectionEvent(selectedResult);
        }
    }

    // Helper methods
    detectSearchType() {
        const term = this.searchTerm.trim();
        
        if (/^\d{11}$/.test(term)) {
            this.searchType = 'ABN';
        } else if (/^\d{9}$/.test(term)) {
            this.searchType = 'ACN';
        } else if (term.length >= 2) {
            this.searchType = 'NAME';
        } else {
            this.searchType = '';
        }
    }

    validateInput() {
        const term = this.searchTerm.trim();
        this.validationError = '';

        if (!term) {
            return;
        }

        switch (this.searchType) {
            case 'ABN':
                if (!/^\d{11}$/.test(term)) {
                    this.validationError = 'ABN must be exactly 11 digits';
                }
                break;
            case 'ACN':
                if (!/^\d{9}$/.test(term)) {
                    this.validationError = 'ACN must be exactly 9 digits';
                }
                break;
            case 'NAME':
                if (term.length < 2) {
                    this.validationError = 'Company name must be at least 2 characters';
                }
                break;
            default:
                if (term.length > 0 && term.length < 2 && !/^\d+$/.test(term)) {
                    this.validationError = 'Please enter at least 2 characters for company name search';
                }
        }
    }

    clearPreviousResults() {
        this.searchResults = [];
        this.errorMessage = '';
        this.hasSearched = false;
    }

    // Custom event dispatchers for parent communication
    dispatchSearchSuccessEvent() {
        const successEvent = new CustomEvent('searchsuccess', {
            detail: {
                componentName: 'abnLookupTestV2',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                results: this.searchResults,
                resultCount: this.resultsCount,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('resultselected', {
            detail: {
                componentName: 'abnLookupTestV2',
                selectedResult: selectedResult,
                searchTerm: this.searchTerm,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV2',
                errorMessage: errorMessage,
                searchTerm: this.searchTerm,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.clearPreviousResults();
        if (this.searchTerm) {
            this.handleSearch();
        }
    }

    @api
    validateComponent() {
        this.validateInput();
        return !this.validationError && this.searchTerm.trim().length > 0;
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchType = '';
        this.clearPreviousResults();
        this.validationError = '';
    }

    @api
    getSearchResults() {
        return this.searchResults;
    }
}
