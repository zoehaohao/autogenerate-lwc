import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/mynewabnLookupTestV2Controller.searchABN';

export default class MynewabnLookupTestV2 extends LightningElement {
    // Public API properties for parent component configuration
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;
    @api maxResults = 50;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track hasError = false;
    @track errorMessage = '';
    @track searchType = 'name'; // 'abn', 'acn', 'name'

    // Component state
    searchTimeout;
    currentPage = 1;
    pageSize = 10;

    // Lifecycle hooks
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
            this.detectSearchType();
        }
    }

    // Computed properties
    get searchDescription() {
        switch (this.searchType) {
            case 'abn':
                return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
            case 'acn':
                return 'You can find verify the identify of a Company / Business / Trading through using Australian Company Number (ACN).';
            default:
                return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
        }
    }

    get searchPlaceholder() {
        switch (this.searchType) {
            case 'abn':
                return 'Enter 11-digit ABN';
            case 'acn':
                return 'Enter 9-digit ACN';
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
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    get hasResults() {
        return !this.isLoading && !this.hasError && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.hasError && this.searchResults.length === 0 && this.searchTerm;
    }

    get hasSelectedResult() {
        return this.selectedResult !== null;
    }

    get showPagination() {
        return this.searchResults.length > this.pageSize;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearResults();
        
        // Clear existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Debounce search for company names
        if (this.searchType === 'name' && this.searchTerm.length >= 2) {
            this.searchTimeout = setTimeout(() => {
                this.performSearch();
            }, 500);
        }
    }

    handleKeyUp(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    handleSearch() {
        if (!this.isSearchDisabled) {
            this.performSearch();
        }
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

    handleChangeAbn() {
        this.selectedResult = null;
        this.clearResults();
        
        // Dispatch change event to parent
        const changeEvent = new CustomEvent('abnchanged', {
            detail: {
                previousResult: this.selectedResult,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
        this.currentPage = event.detail.currentPage;
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize;
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

    async performSearch() {
        if (!this.validateSearch()) {
            return;
        }

        this.isLoading = true;
        this.hasError = false;
        this.errorMessage = '';

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType,
                maxResults: this.maxResults
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
                
                // Dispatch search success event
                const successEvent = new CustomEvent('searchsuccess', {
                    detail: {
                        searchTerm: this.searchTerm,
                        searchType: this.searchType,
                        resultCount: this.searchResults.length,
                        timestamp: new Date().toISOString()
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(successEvent);
            } else {
                this.handleSearchError(result.message);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.handleSearchError('An unexpected error occurred while searching. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    validateSearch() {
        switch (this.searchType) {
            case 'abn':
                if (!/^\d{11}$/.test(this.searchTerm.replace(/\s/g, ''))) {
                    this.handleSearchError('Please enter a valid 11-digit ABN number.');
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(this.searchTerm.replace(/\s/g, ''))) {
                    this.handleSearchError('Please enter a valid 9-digit ACN number.');
                    return false;
                }
                break;
            case 'name':
                if (this.searchTerm.length < 2) {
                    this.handleSearchError('Please enter at least 2 characters for company name search.');
                    return false;
                }
                break;
        }
        return true;
    }

    processSearchResults(data) {
        if (Array.isArray(data)) {
            this.searchResults = data.map((item, index) => ({
                id: `result-${index}`,
                abnNumber: this.formatABN(item.abn?.identifier_value || ''),
                entityName: item.other_trading_name?.organisation_name || 'N/A',
                abnStatus: this.formatABNStatus(item.entity_status),
                entityType: item.entity_type?.entity_description || 'N/A',
                gstStatus: this.formatGSTStatus(item.goods_and_services_tax),
                businessLocation: item.main_business_location || 'N/A',
                rawData: item
            }));
        } else if (data && typeof data === 'object') {
            // Single result
            this.searchResults = [{
                id: 'result-0',
                abnNumber: this.formatABN(data.abn?.identifier_value || ''),
                entityName: data.other_trading_name?.organisation_name || 'N/A',
                abnStatus: this.formatABNStatus(data.entity_status),
                entityType: data.entity_type?.entity_description || 'N/A',
                gstStatus: this.formatGSTStatus(data.goods_and_services_tax),
                businessLocation: data.main_business_location || 'N/A',
                rawData: data
            }];
        } else {
            this.searchResults = [];
        }

        // Initialize pagination
        this.paginatedResults = this.searchResults.slice(0, this.pageSize);
    }

    formatABN(abn) {
        if (!abn) return 'N/A';
        // Format as XX XXX XXX XXX
        return abn.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    }

    formatABNStatus(entityStatus) {
        if (!entityStatus) return 'N/A';
        const status = entityStatus.entity_status_code || 'Unknown';
        const effectiveFrom = entityStatus.effective_from;
        
        if (effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status;
    }

    formatGSTStatus(gstInfo) {
        if (!gstInfo) return 'N/A';
        const effectiveFrom = gstInfo.effective_from;
        
        if (effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `Registered from ${this.formatDate(effectiveFrom)}`;
        }
        return 'Registered';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') return '';
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

    handleSearchError(message) {
        this.hasError = true;
        this.errorMessage = message;
        this.searchResults = [];
        this.paginatedResults = [];
        
        // Dispatch error event to parent
        const errorEvent = new CustomEvent('searcherror', {
            detail: {
                errorMessage: message,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    clearResults() {
        this.searchResults = [];
        this.paginatedResults = [];
        this.hasError = false;
        this.errorMessage = '';
    }

    // Public API methods for parent components
    @api
    performExternalSearch(searchTerm, searchType) {
        this.searchTerm = searchTerm;
        this.searchType = searchType || 'name';
        return this.performSearch();
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.selectedResult = null;
        this.clearResults();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    validateComponent() {
        return {
            isValid: !this.hasError && (this.hasSelectedResult || this.searchResults.length > 0),
            selectedResult: this.selectedResult,
            searchTerm: this.searchTerm,
            searchType: this.searchType
        };
    }
}
