import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/ABNLookupCompController.searchABN';

export default class ABNLookupComp extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentSearchType = 'name';
    @track showResults = false;
    @track currentView = 'search'; // 'search', 'results', 'selected'

    // Computed properties
    get actionButtonLabel() {
        return this.currentView === 'selected' ? 'Change ABN' : 'Find ABN';
    }

    get descriptionText() {
        if (this.currentView === 'selected') {
            return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
        }
        return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
    }

    get searchPlaceholder() {
        switch (this.currentSearchType) {
            case 'abn':
                return 'Enter 11-digit ABN';
            case 'acn':
                return 'Enter 9-digit ACN';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchButtonLabel() {
        return this.currentView === 'selected' ? 'Verify' : 'Search';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    get hasResults() {
        return this.showResults && this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return this.showResults && (!this.searchResults || this.searchResults.length === 0) && !this.isLoading && !this.errorMessage;
    }

    get showPagination() {
        return this.hasResults && this.searchResults.length > 10;
    }

    // Event handlers
    handleActionButton() {
        if (this.currentView === 'selected') {
            this.handleChangeABN();
        } else {
            this.currentView = 'search';
            this.resetSearch();
        }
    }

    handleSearchInput(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
    }

    handleSearch() {
        if (this.validateInput()) {
            this.performSearch();
        }
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.searchResults.find(result => result.id === resultId);
        if (selected) {
            this.selectedResult = selected;
            this.currentView = 'selected';
            this.showResults = false;
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(selected);
        }
    }

    handleChangeABN() {
        this.currentView = 'search';
        this.selectedResult = null;
        this.resetSearch();
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Validation methods
    validateInput() {
        const trimmedTerm = this.searchTerm.trim();
        
        if (!trimmedTerm) {
            this.showError('Please enter a search term');
            return false;
        }

        switch (this.currentSearchType) {
            case 'abn':
                if (!/^\d{11}$/.test(trimmedTerm)) {
                    this.showError('ABN must be 11 digits');
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(trimmedTerm)) {
                    this.showError('ACN must be 9 digits');
                    return false;
                }
                break;
            case 'name':
                if (trimmedTerm.length < 2) {
                    this.showError('Company name must be at least 2 characters');
                    return false;
                }
                break;
        }

        return true;
    }

    detectSearchType() {
        const trimmedTerm = this.searchTerm.trim();
        
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.currentSearchType = 'abn';
        } else if (/^\d{9}$/.test(trimmedTerm)) {
            this.currentSearchType = 'acn';
        } else {
            this.currentSearchType = 'name';
        }
    }

    // API integration
    async performSearch() {
        this.isLoading = true;
        this.clearMessages();
        
        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.currentSearchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
            } else {
                this.showError(result.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('An unexpected error occurred. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (data && Array.isArray(data) && data.length > 0) {
            this.searchResults = data.map((item, index) => ({
                id: `result-${index}`,
                abnNumber: item.abnNumber || 'N/A',
                entityName: item.entityName || 'N/A',
                abnStatus: item.abnStatus || 'N/A',
                entityType: item.entityType || 'N/A',
                gstStatus: item.gstStatus || 'N/A',
                businessLocation: item.businessLocation || 'N/A',
                rawData: item
            }));
            
            this.showResults = true;
            this.currentView = 'results';
            
            // Initialize pagination
            this.paginatedResults = this.searchResults.slice(0, 10);
            
            // Dispatch results event to parent
            this.dispatchResultsEvent(this.searchResults);
        } else {
            this.searchResults = [];
            this.showResults = true;
        }
    }

    // Utility methods
    clearMessages() {
        this.errorMessage = '';
    }

    showError(message) {
        this.errorMessage = message;
        this.showResults = false;
    }

    resetSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.paginatedResults = [];
        this.showResults = false;
        this.clearMessages();
        this.currentSearchType = 'name';
    }

    // Parent communication methods
    dispatchSelectionEvent(selectedData) {
        const selectionEvent = new CustomEvent('abnselected', {
            detail: {
                componentName: 'ABNLookupComp',
                selectedResult: selectedData,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchResultsEvent(results) {
        const resultsEvent = new CustomEvent('searchcomplete', {
            detail: {
                componentName: 'ABNLookupComp',
                results: results,
                searchTerm: this.searchTerm,
                searchType: this.currentSearchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(resultsEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'ABNLookupComp',
                errorMessage: error.message || error,
                searchTerm: this.searchTerm,
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
        this.resetSearch();
    }

    @api
    validateComponent() {
        return this.selectedResult !== null;
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    clearSelection() {
        this.selectedResult = null;
        this.currentView = 'search';
        this.resetSearch();
    }
}
