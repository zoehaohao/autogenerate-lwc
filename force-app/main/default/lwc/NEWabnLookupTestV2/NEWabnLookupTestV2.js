import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/NEWabnLookupTestV2Controller.searchABN';

export default class NEWabnLookupTestV2 extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';
    @track currentPage = 1;
    @track pageSize = 10;

    // Component state
    hasSearched = false;
    debounceTimeout;

    // Lifecycle hooks
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
        }
    }

    // Getters for dynamic properties
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
        switch (this.searchType) {
            case 'abn':
            case 'acn':
                return 'Verify';
            default:
                return 'Search';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2 || this.isReadOnly;
    }

    get hasResults() {
        return !this.isLoading && this.searchResults && this.searchResults.length > 0 && !this.selectedResult;
    }

    get showNoResults() {
        return !this.isLoading && this.hasSearched && (!this.searchResults || this.searchResults.length === 0) && !this.selectedResult;
    }

    get showPagination() {
        return this.searchResults && this.searchResults.length > this.pageSize;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearError();
        
        // Clear previous results when search term changes
        if (!this.searchTerm) {
            this.searchResults = [];
            this.paginatedResults = [];
            this.hasSearched = false;
        }
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    handleSearch() {
        if (this.isSearchDisabled) {
            return;
        }

        if (!this.validateInput()) {
            return;
        }

        this.performSearch();
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.searchResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = { ...selected };
            
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('abnselected', {
                detail: {
                    selectedResult: this.selectedResult,
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

    handleChangeABN() {
        this.selectedResult = null;
        this.searchTerm = '';
        this.searchResults = [];
        this.paginatedResults = [];
        this.hasSearched = false;
        this.clearError();
        
        // Dispatch change event to parent
        const changeEvent = new CustomEvent('abnchanged', {
            detail: {
                action: 'reset',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData || [];
        this.currentPage = event.detail.currentPage || 1;
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize || 10;
    }

    // Search type detection
    detectSearchType() {
        if (!this.searchTerm) {
            this.searchType = 'name';
            return;
        }

        const cleanTerm = this.searchTerm.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(cleanTerm)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(cleanTerm)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }

    // Input validation
    validateInput() {
        const cleanTerm = this.searchTerm.replace(/\s/g, '');
        
        switch (this.searchType) {
            case 'abn':
                if (!/^\d{11}$/.test(cleanTerm)) {
                    this.showError('Please enter a valid 11-digit ABN number');
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(cleanTerm)) {
                    this.showError('Please enter a valid 9-digit ACN number');
                    return false;
                }
                break;
            case 'name':
                if (this.searchTerm.length < 2) {
                    this.showError('Please enter at least 2 characters for company name search');
                    return false;
                }
                break;
        }
        
        return true;
    }

    // API integration
    async performSearch() {
        this.isLoading = true;
        this.clearError();
        this.hasSearched = true;

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
            } else {
                this.showError(result.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('An error occurred while searching. Please try again.');
            
            // Dispatch error event to parent
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'NEWabnLookupTestV2',
                    errorMessage: error.message,
                    searchTerm: this.searchTerm,
                    searchType: this.searchType,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);
        } finally {
            this.isLoading = false;
        }
    }

    // Process search results
    processSearchResults(data) {
        if (!data) {
            this.searchResults = [];
            this.paginatedResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((item, index) => ({
            id: `result_${index}`,
            abnNumber: this.extractABNNumber(item),
            entityName: this.extractEntityName(item),
            abnStatus: this.extractABNStatus(item),
            entityType: this.extractEntityType(item),
            gstStatus: this.extractGSTStatus(item),
            businessLocation: this.extractBusinessLocation(item),
            rawData: item
        }));

        // Initialize pagination
        this.initializePagination();

        // Dispatch results event to parent
        const resultsEvent = new CustomEvent('searchcomplete', {
            detail: {
                results: this.searchResults,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                resultCount: this.searchResults.length,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(resultsEvent);
    }

    // Data extraction methods
    extractABNNumber(item) {
        return item?.abn?.identifier_value || 'N/A';
    }

    extractEntityName(item) {
        return item?.other_trading_name?.organisation_name || 'N/A';
    }

    extractABNStatus(item) {
        const status = item?.entity_status?.entity_status_code || 'Unknown';
        const effectiveFrom = item?.entity_status?.effective_from;
        return effectiveFrom ? `${status} from ${this.formatDate(effectiveFrom)}` : status;
    }

    extractEntityType(item) {
        return item?.entity_type?.entity_description || 'N/A';
    }

    extractGSTStatus(item) {
        const effectiveFrom = item?.goods_and_services_tax?.effective_from;
        return effectiveFrom ? `Registered from ${this.formatDate(effectiveFrom)}` : 'Not registered';
    }

    extractBusinessLocation(item) {
        return item?.asic_number || 'N/A';
    }

    // Utility methods
    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return 'N/A';
        }
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-AU', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    initializePagination() {
        if (this.searchResults.length <= this.pageSize) {
            this.paginatedResults = [...this.searchResults];
        } else {
            this.paginatedResults = this.searchResults.slice(0, this.pageSize);
        }
    }

    showError(message) {
        this.errorMessage = message;
        setTimeout(() => {
            this.clearError();
        }, 5000);
    }

    clearError() {
        this.errorMessage = '';
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm) {
            this.performSearch();
        }
    }

    @api
    validateComponent() {
        return {
            isValid: !this.errorMessage && (this.selectedResult || !this.hasSearched),
            selectedResult: this.selectedResult,
            searchTerm: this.searchTerm,
            searchType: this.searchType
        };
    }

    @api
    clearSelection() {
        this.handleChangeABN();
    }

    @api
    setSearchTerm(term) {
        this.searchTerm = term;
        this.detectSearchType();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }
}
