import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newabnLookupTestController.searchABN';

export default class NewabnLookupTest extends LightningElement {
    // Public API properties for parent components
    @api recordId;
    @api configSettings;
    @api initialSearchValue = '';
    @api isReadOnly = false;
    @api showSelectedResult = false;

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
                return 'Enter 11-digit ABN number';
            case 'acn':
                return 'Enter 9-digit ACN number';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchButtonLabel() {
        return this.currentView === 'selected' ? 'Verify' : 'Search';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchValue || this.searchValue.length < 2;
    }

    get showError() {
        return this.errorMessage && this.errorMessage.length > 0;
    }

    get showResults() {
        return this.currentView === 'results' && this.paginatedResults && this.paginatedResults.length > 0;
    }

    get showNoResults() {
        return this.currentView === 'results' && this.searchResults && this.searchResults.length === 0 && !this.isLoading;
    }

    get showPagination() {
        return this.searchResults && this.searchResults.length > 10;
    }

    // Lifecycle methods
    connectedCallback() {
        if (this.initialSearchValue) {
            this.searchValue = this.initialSearchValue;
        }
        if (this.showSelectedResult) {
            this.currentView = 'selected';
        }
    }

    // Event handlers
    handleActionButton() {
        if (this.currentView === 'selected') {
            this.handleChangeAbn();
        } else {
            this.currentView = 'search';
            this.clearResults();
        }
    }

    handleSearchChange(event) {
        this.searchValue = event.target.value;
        this.detectSearchType();
        this.clearError();
        
        // Debounce search
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        if (this.searchValue && this.searchValue.length >= 2) {
            this.searchTimeout = setTimeout(() => {
                this.performSearch();
            }, 500);
        }
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
        const resultId = event.target.dataset.resultId;
        const selected = this.searchResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = { ...selected };
            this.currentView = 'selected';
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(selected);
        }
    }

    handleChangeAbn() {
        this.selectedResult = null;
        this.currentView = 'search';
        this.clearResults();
        this.searchValue = '';
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Search functionality
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

    validateInput() {
        const value = this.searchValue.trim();
        
        if (!value) {
            this.showErrorMessage('Please enter a search term');
            return false;
        }

        if (this.currentSearchType === 'abn' && !/^\d{11}$/.test(value.replace(/\s/g, ''))) {
            this.showErrorMessage('ABN must be exactly 11 digits');
            return false;
        }

        if (this.currentSearchType === 'acn' && !/^\d{9}$/.test(value.replace(/\s/g, ''))) {
            this.showErrorMessage('ACN must be exactly 9 digits');
            return false;
        }

        if (this.currentSearchType === 'name' && value.length < 2) {
            this.showErrorMessage('Company name must be at least 2 characters');
            return false;
        }

        return true;
    }

    async performSearch() {
        if (!this.validateInput()) {
            return;
        }

        this.isLoading = true;
        this.clearError();
        this.clearResults();

        try {
            const searchParams = {
                searchValue: this.searchValue.trim(),
                searchType: this.currentSearchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
                this.currentView = 'results';
                
                // Dispatch search event to parent
                this.dispatchSearchEvent(result.data);
            } else {
                this.showErrorMessage(result.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showErrorMessage('An error occurred while searching. Please try again.');
            
            // Dispatch error event to parent
            this.dispatchErrorEvent(error);
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data || !Array.isArray(data)) {
            this.searchResults = [];
            return;
        }

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

        // Initialize pagination
        if (this.searchResults.length <= 10) {
            this.paginatedResults = [...this.searchResults];
        }
    }

    // Utility methods
    clearResults() {
        this.searchResults = [];
        this.paginatedResults = [];
    }

    clearError() {
        this.errorMessage = '';
    }

    showErrorMessage(message) {
        this.errorMessage = message;
    }

    // Parent communication methods
    dispatchSearchEvent(results) {
        const searchEvent = new CustomEvent('search', {
            detail: {
                componentName: 'newabnLookupTest',
                searchValue: this.searchValue,
                searchType: this.currentSearchType,
                results: results,
                resultCount: results ? results.length : 0,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(searchEvent);
    }

    dispatchSelectionEvent(selectedData) {
        const selectionEvent = new CustomEvent('selection', {
            detail: {
                componentName: 'newabnLookupTest',
                selectedResult: selectedData,
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
                componentName: 'newabnLookupTest',
                errorMessage: error.message || 'Unknown error occurred',
                errorCode: error.code || 'UNKNOWN_ERROR',
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
        if (this.searchValue) {
            this.performSearch();
        }
    }

    @api
    validateComponent() {
        return this.validateInput();
    }

    @api
    clearSearch() {
        this.searchValue = '';
        this.clearResults();
        this.clearError();
        this.selectedResult = null;
        this.currentView = 'search';
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    setSearchValue(value) {
        this.searchValue = value;
        this.detectSearchType();
    }
}
