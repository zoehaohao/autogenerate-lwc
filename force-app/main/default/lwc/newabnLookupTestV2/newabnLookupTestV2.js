import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newabnLookupTestV2Controller.searchABN';

export default class NewabnLookupTestV2 extends LightningElement {
    // Public API properties for parent communication
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track allResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';
    @track selectedResult = null;

    // Component state
    hasSearched = false;

    // Initialize component
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
        }
    }

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

    get searchButtonLabel() {
        return this.searchType === 'abn' ? 'Verify' : 'Search';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    get hasResults() {
        return !this.isLoading && this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && this.hasSearched && (!this.searchResults || this.searchResults.length === 0) && !this.errorMessage;
    }

    get showPagination() {
        return this.allResults && this.allResults.length > 10;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearPreviousResults();
    }

    handleSearch() {
        if (this.validateInput()) {
            this.performSearch();
        }
    }

    handleSelectResult(event) {
        const resultId = event.currentTarget.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            this.selectedResult = selectedResult;
            
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('abnselected', {
                detail: {
                    selectedResult: selectedResult,
                    searchTerm: this.searchTerm,
                    searchType: this.searchType,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);
        }
    }

    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Private methods
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
        this.errorMessage = '';
        
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }

        const cleanTerm = this.searchTerm.replace(/\s/g, '');

        switch (this.searchType) {
            case 'abn':
                if (!/^\d{11}$/.test(cleanTerm)) {
                    this.errorMessage = 'ABN must be exactly 11 digits';
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(cleanTerm)) {
                    this.errorMessage = 'ACN must be exactly 9 digits';
                    return false;
                }
                break;
            case 'name':
                if (this.searchTerm.trim().length < 2) {
                    this.errorMessage = 'Company name must be at least 2 characters';
                    return false;
                }
                break;
        }

        return true;
    }

    async performSearch() {
        this.isLoading = true;
        this.errorMessage = '';
        this.hasSearched = true;

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });

            if (result.success) {
                this.allResults = result.data || [];
                this.searchResults = this.allResults.slice(0, 10); // Show first 10 results
                
                // Dispatch success event to parent
                const successEvent = new CustomEvent('searchcomplete', {
                    detail: {
                        results: this.allResults,
                        searchTerm: this.searchTerm,
                        searchType: this.searchType,
                        resultCount: this.allResults.length,
                        timestamp: new Date().toISOString()
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(successEvent);
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.searchResults = [];
                this.allResults = [];
                
                // Dispatch error event to parent
                this.dispatchErrorEvent(result.message);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.searchResults = [];
            this.allResults = [];
            
            // Dispatch error event to parent
            this.dispatchErrorEvent(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    clearPreviousResults() {
        this.searchResults = [];
        this.allResults = [];
        this.errorMessage = '';
        this.hasSearched = false;
        this.selectedResult = null;
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'newabnLookupTestV2',
                errorMessage: errorMessage,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.clearPreviousResults();
    }

    @api
    validateComponent() {
        return this.validateInput();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    setSearchTerm(searchTerm) {
        this.searchTerm = searchTerm;
        this.detectSearchType();
        this.clearPreviousResults();
    }
}
