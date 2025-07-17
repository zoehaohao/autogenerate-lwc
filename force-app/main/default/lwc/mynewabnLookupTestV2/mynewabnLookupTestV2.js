import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/mynewabnLookupTestV2Controller.searchABN';

export default class MynewabnLookupTestV2 extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api configSettings;
    @api initialSearchValue = '';
    @api isReadOnly = false;
    @api maxResults = 50;

    // Tracked properties
    @track searchValue = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentSearchType = 'name';
    @track currentView = 'search'; // 'search', 'results', 'selected'

    // Component state
    searchTimeout;
    
    connectedCallback() {
        if (this.initialSearchValue) {
            this.searchValue = this.initialSearchValue;
        }
    }

    // Computed properties
    get actionButtonLabel() {
        switch (this.currentView) {
            case 'selected':
                return 'Change ABN';
            default:
                return 'Find ABN';
        }
    }

    get searchInstructions() {
        switch (this.currentView) {
            case 'selected':
                return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
            case 'results':
                return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
            default:
                return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
        }
    }

    get searchPlaceholder() {
        switch (this.currentSearchType) {
            case 'abn':
                return 'Enter 11-digit ABN number';
            case 'acn':
                return 'Enter 9-digit ACN number';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchButtonLabel() {
        switch (this.currentView) {
            case 'selected':
                return 'Verify';
            default:
                return 'Search';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchValue || this.searchValue.length < 2;
    }

    get showError() {
        return this.errorMessage && this.errorMessage.length > 0;
    }

    get showResults() {
        return this.currentView === 'results' && this.searchResults.length > 0 && !this.isLoading;
    }

    get showSelectedResult() {
        return this.currentView === 'selected' && this.selectedResult;
    }

    get showPagination() {
        return this.searchResults.length > 10;
    }

    // Event handlers
    handleActionButtonClick() {
        if (this.currentView === 'selected') {
            this.resetToSearch();
        }
    }

    handleSearchChange(event) {
        this.searchValue = event.target.value;
        this.detectSearchType();
        this.clearError();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    handleSearch() {
        if (this.validateInput()) {
            this.performSearch();
        }
    }

    handleSelectResult(event) {
        const resultId = event.currentTarget.dataset.resultId;
        const selected = this.searchResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = selected;
            this.currentView = 'selected';
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(selected);
        }
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Search type detection
    detectSearchType() {
        const value = this.searchValue.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(value)) {
            this.currentSearchType = 'abn';
        } else if (/^\d{9}$/.test(value)) {
            this.currentSearchType = 'acn';
        } else {
            this.currentSearchType = 'name';
        }
    }

    // Validation
    validateInput() {
        this.clearError();
        
        if (!this.searchValue || this.searchValue.trim().length === 0) {
            this.setError('Please enter a search term');
            return false;
        }

        const trimmedValue = this.searchValue.trim();
        
        switch (this.currentSearchType) {
            case 'abn':
                if (!/^\d{11}$/.test(trimmedValue.replace(/\s/g, ''))) {
                    this.setError('ABN must be exactly 11 digits');
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(trimmedValue.replace(/\s/g, ''))) {
                    this.setError('ACN must be exactly 9 digits');
                    return false;
                }
                break;
            case 'name':
                if (trimmedValue.length < 2) {
                    this.setError('Company name must be at least 2 characters');
                    return false;
                }
                break;
        }
        
        return true;
    }

    // Search execution
    async performSearch() {
        this.isLoading = true;
        this.clearError();
        
        try {
            const searchParams = {
                searchValue: this.searchValue.trim(),
                searchType: this.currentSearchType,
                maxResults: this.maxResults
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
            } else {
                this.setError(result.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.setError('An unexpected error occurred. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    // Results processing
    processSearchResults(data) {
        if (!data || data.length === 0) {
            this.setError(`No matching results for ${this.searchValue}, please check the inputs and try again.`);
            this.searchResults = [];
            this.paginatedResults = [];
            this.currentView = 'search';
            return;
        }

        // Transform API response to component format
        this.searchResults = data.map((item, index) => ({
            id: `result_${index}`,
            abnNumber: item.abnNumber || 'N/A',
            entityName: item.entityName || 'N/A',
            abnStatus: item.abnStatus || 'N/A',
            entityType: item.entityType || 'N/A',
            gstStatus: item.gstStatus || 'N/A',
            businessLocation: item.businessLocation || 'N/A',
            rawData: item
        }));

        this.currentView = 'results';
        
        // Initialize pagination data
        this.paginatedResults = this.searchResults.slice(0, 10);
        
        // Dispatch search results event to parent
        this.dispatchSearchResultsEvent(this.searchResults);
    }

    // Utility methods
    clearError() {
        this.errorMessage = '';
    }

    setError(message) {
        this.errorMessage = message;
    }

    resetToSearch() {
        this.currentView = 'search';
        this.selectedResult = null;
        this.searchResults = [];
        this.paginatedResults = [];
        this.searchValue = '';
        this.clearError();
    }

    // Parent communication events
    dispatchSearchResultsEvent(results) {
        const searchEvent = new CustomEvent('searchresults', {
            detail: {
                componentName: 'mynewabnLookupTestV2',
                searchValue: this.searchValue,
                searchType: this.currentSearchType,
                results: results,
                resultCount: results.length,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(searchEvent);
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('abnselected', {
            detail: {
                componentName: 'mynewabnLookupTestV2',
                selectedResult: selectedResult,
                abnNumber: selectedResult.abnNumber,
                entityName: selectedResult.entityName,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'mynewabnLookupTestV2',
                errorMessage: error.message || error,
                searchValue: this.searchValue,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    // Public API methods for parent components
    @api
    performExternalSearch(searchValue, searchType) {
        this.searchValue = searchValue;
        this.currentSearchType = searchType || 'name';
        return this.performSearch();
    }

    @api
    clearResults() {
        this.resetToSearch();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    validateComponent() {
        return {
            isValid: this.selectedResult !== null,
            selectedResult: this.selectedResult,
            hasError: this.showError,
            errorMessage: this.errorMessage
        };
    }
}
