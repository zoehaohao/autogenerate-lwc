import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newestabnLookupTestV2Controller.searchABN';

export default class NewestAbnLookupTestV2 extends LightningElement {
    // Public API properties for parent components
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;
    @api maxResults = 50;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track validationError = '';
    @track searchType = '';
    @track hasSearched = false;

    // Component state
    searchTimeout;
    currentPage = 1;
    pageSize = 10;

    // Lifecycle hooks
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
        }
    }

    // Computed properties
    get searchPlaceholder() {
        switch (this.searchType) {
            case 'ABN':
                return 'Enter 11-digit ABN number';
            case 'ACN':
                return 'Enter 9-digit ACN number';
            case 'NAME':
                return 'Enter company or business name';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchButtonLabel() {
        return this.searchType === 'ABN' ? 'Verify' : 'Search';
    }

    get isSearchDisabled() {
        return this.isLoading || this.isReadOnly || !this.searchTerm || this.validationError;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading;
    }

    get showNoResults() {
        return this.hasSearched && !this.hasResults && !this.isLoading && !this.errorMessage;
    }

    get showPagination() {
        return this.hasResults && this.searchResults.length > this.pageSize;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.validateInput();
        
        // Clear previous results and errors
        this.clearResults();
        
        // Debounce search for name searches
        if (this.searchType === 'NAME' && this.searchTerm.length >= 2) {
            this.debounceSearch();
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

        this.performSearch();
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('resultselected', {
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
        this.paginatedResults = event.detail.paginatedData;
        this.currentPage = event.detail.currentPage;
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize;
    }

    // Search functionality
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
                    this.validationError = 'Please enter at least 2 characters or a valid ABN/ACN';
                }
        }
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
        }, 500);
    }

    async performSearch() {
        if (!this.searchTerm || this.validationError) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.hasSearched = true;

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType,
                maxResults: this.maxResults
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });

            if (result.success) {
                this.processSearchResults(result.data);
                
                // Dispatch success event
                this.dispatchSuccessEvent('Search completed successfully', result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchErrorEvent(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data) {
            this.searchResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((item, index) => {
            return {
                id: `result-${index}`,
                abnNumber: this.extractValue(item, 'abn.identifier_value'),
                entityName: this.extractValue(item, 'other_trading_name.organisation_name') || 'N/A',
                abnStatus: this.formatABNStatus(item),
                entityType: this.extractValue(item, 'entity_type.entity_description') || 'N/A',
                gstStatus: this.formatGSTStatus(item),
                businessLocation: this.extractValue(item, 'asic_number') || 'N/A',
                rawData: item
            };
        });

        // Initialize pagination
        this.initializePagination();
    }

    extractValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    formatABNStatus(item) {
        const status = this.extractValue(item, 'entity_status.entity_status_code');
        const effectiveFrom = this.extractValue(item, 'entity_status.effective_from');
        
        if (status && effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status || 'N/A';
    }

    formatGSTStatus(item) {
        const effectiveFrom = this.extractValue(item, 'goods_and_services_tax.effective_from');
        
        if (effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `Registered from ${this.formatDate(effectiveFrom)}`;
        }
        return 'Not registered';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return '';
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

    clearResults() {
        this.searchResults = [];
        this.paginatedResults = [];
        this.errorMessage = '';
        this.hasSearched = false;
    }

    // Event dispatchers
    dispatchSuccessEvent(message, data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'newestabnLookupTestV2',
                message: message,
                data: data,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'newestabnLookupTestV2',
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
    performExternalSearch(searchTerm, searchType) {
        this.searchTerm = searchTerm;
        this.searchType = searchType || '';
        this.detectSearchType();
        this.validateInput();
        
        if (!this.validationError) {
            this.performSearch();
        }
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchType = '';
        this.validationError = '';
        this.clearResults();
    }

    @api
    getSearchResults() {
        return {
            results: this.searchResults,
            searchTerm: this.searchTerm,
            searchType: this.searchType,
            hasResults: this.hasResults
        };
    }

    @api
    validateComponent() {
        this.validateInput();
        return !this.validationError;
    }
}
