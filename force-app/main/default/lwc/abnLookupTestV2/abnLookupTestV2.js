import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchValue = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track validationError = '';
    @track searchType = '';

    // Computed properties
    get searchPlaceholder() {
        switch(this.searchType) {
            case 'ABN':
                return 'Enter 11-digit ABN number';
            case 'ACN':
                return 'Enter 9-digit ACN number';
            case 'COMPANY':
                return 'Enter company name (minimum 2 characters)';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchValue || this.validationError;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading;
    }

    get showNoResults() {
        return !this.hasResults && !this.isLoading && !this.errorMessage && this.searchValue;
    }

    // Event handlers
    handleSearchInputChange(event) {
        this.searchValue = event.target.value;
        this.detectSearchType();
        this.validateInput();
        this.clearResults();
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
        this.errorMessage = '';
        this.clearResults();

        try {
            const searchParams = {
                searchValue: this.searchValue,
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.searchResults = result.data || [];
                this.dispatchSearchCompleteEvent(this.searchResults);
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.dispatchErrorEvent(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            this.dispatchSelectionEvent(selectedResult);
        }
    }

    // Utility methods
    detectSearchType() {
        const value = this.searchValue.trim();
        
        if (/^\d{11}$/.test(value)) {
            this.searchType = 'ABN';
        } else if (/^\d{9}$/.test(value)) {
            this.searchType = 'ACN';
        } else if (value.length >= 2) {
            this.searchType = 'COMPANY';
        } else {
            this.searchType = '';
        }
    }

    validateInput() {
        this.validationError = '';
        const value = this.searchValue.trim();

        if (!value) {
            this.validationError = 'Please enter a search value';
            return false;
        }

        switch(this.searchType) {
            case 'ABN':
                if (!/^\d{11}$/.test(value)) {
                    this.validationError = 'ABN must be exactly 11 digits';
                    return false;
                }
                break;
            case 'ACN':
                if (!/^\d{9}$/.test(value)) {
                    this.validationError = 'ACN must be exactly 9 digits';
                    return false;
                }
                break;
            case 'COMPANY':
                if (value.length < 2) {
                    this.validationError = 'Company name must be at least 2 characters';
                    return false;
                }
                break;
            default:
                this.validationError = 'Please enter a valid ABN (11 digits), ACN (9 digits), or company name (2+ characters)';
                return false;
        }

        return true;
    }

    clearResults() {
        this.searchResults = [];
        this.errorMessage = '';
    }

    // Custom event dispatchers for parent communication
    dispatchSearchCompleteEvent(results) {
        const searchCompleteEvent = new CustomEvent('searchcomplete', {
            detail: {
                componentName: 'abnLookupTestV2',
                searchValue: this.searchValue,
                searchType: this.searchType,
                results: results,
                resultCount: results.length,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(searchCompleteEvent);
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('resultselected', {
            detail: {
                componentName: 'abnLookupTestV2',
                selectedResult: selectedResult,
                searchValue: this.searchValue,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV2',
                errorMessage: typeof error === 'string' ? error : error.message,
                searchValue: this.searchValue,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchValue) {
            this.handleSearch();
        }
    }

    @api
    clearSearch() {
        this.searchValue = '';
        this.searchType = '';
        this.clearResults();
        this.validationError = '';
    }

    @api
    validateComponent() {
        return this.validateInput();
    }

    @api
    getSearchResults() {
        return this.searchResults;
    }
}
