import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    // Public API properties for parent components
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api pageSize = 10;
    @api isReadOnly = false;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track currentPage = 1;
    @track totalRecords = 0;
    @track searchType = 'name'; // 'abn', 'acn', 'name'

    // Private properties
    searchTimeout;
    debounceDelay = 500;

    // Lifecycle hooks
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
        }
    }

    // Getters for dynamic content
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
        return this.searchType === 'name' ? 'Search' : 'Verify';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && this.searchResults.length === 0 && this.searchTerm;
    }

    get paginatedResults() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.searchResults.slice(startIndex, endIndex);
    }

    get showPagination() {
        return this.totalRecords > this.pageSize;
    }

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get startRecord() {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endRecord() {
        const end = this.currentPage * this.pageSize;
        return end > this.totalRecords ? this.totalRecords : end;
    }

    get pageNumbers() {
        const pages = [];
        const totalPages = this.totalPages;
        const currentPage = this.currentPage;
        
        // Show up to 5 page numbers
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push({
                label: i.toString(),
                value: i,
                variant: i === currentPage ? 'brand' : 'neutral'
            });
        }

        return pages;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearError();
        
        // Clear existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Set new timeout for debounced search
        this.searchTimeout = setTimeout(() => {
            if (this.searchTerm && this.searchTerm.length >= 2) {
                this.performSearch();
            }
        }, this.debounceDelay);
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    handleSearch() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.performSearch();
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            // Dispatch custom event to parent
            const selectEvent = new CustomEvent('resultselected', {
                detail: {
                    selectedResult: selectedResult,
                    searchTerm: this.searchTerm,
                    searchType: this.searchType,
                    timestamp: new Date().toISOString()
                }
            });
            this.dispatchEvent(selectEvent);
        }
    }

    // Pagination handlers
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page);
        this.currentPage = pageNumber;
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
        this.clearError();
        this.currentPage = 1;

        try {
            const result = await searchABN({
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            });

            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSuccessEvent(result);
            } else {
                this.handleSearchError(result.message);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.handleSearchError('An unexpected error occurred. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    validateSearch() {
        this.clearError();

        if (!this.searchTerm || this.searchTerm.trim().length < 2) {
            this.errorMessage = 'Please enter at least 2 characters to search.';
            return false;
        }

        const term = this.searchTerm.replace(/\s/g, '');
        
        if (this.searchType === 'abn' && !/^\d{11}$/.test(term)) {
            this.errorMessage = 'ABN must be exactly 11 digits.';
            return false;
        }

        if (this.searchType === 'acn' && !/^\d{9}$/.test(term)) {
            this.errorMessage = 'ACN must be exactly 9 digits.';
            return false;
        }

        return true;
    }

    processSearchResults(data) {
        if (!data) {
            this.searchResults = [];
            this.totalRecords = 0;
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((item, index) => {
            return {
                id: `result-${index}`,
                abn: this.extractABN(item),
                entityName: this.extractEntityName(item),
                abnStatus: this.extractABNStatus(item),
                entityType: this.extractEntityType(item),
                gstStatus: this.extractGSTStatus(item),
                businessLocation: this.extractBusinessLocation(item),
                rawData: item
            };
        });

        this.totalRecords = this.searchResults.length;
    }

    extractABN(item) {
        return item.abn?.identifier_value || 'N/A';
    }

    extractEntityName(item) {
        return item.other_trading_name?.organisation_name || 'N/A';
    }

    extractABNStatus(item) {
        const status = item.entity_status?.entity_status_code || 'Unknown';
        const effectiveFrom = item.entity_status?.effective_from;
        return effectiveFrom ? `${status} from ${this.formatDate(effectiveFrom)}` : status;
    }

    extractEntityType(item) {
        return item.entity_type?.entity_description || 'N/A';
    }

    extractGSTStatus(item) {
        const gstFrom = item.goods_and_services_tax?.effective_from;
        return gstFrom ? `Registered from ${this.formatDate(gstFrom)}` : 'Not registered';
    }

    extractBusinessLocation(item) {
        return item.business_location || 'N/A';
    }

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

    handleSearchError(message) {
        this.errorMessage = message;
        this.searchResults = [];
        this.totalRecords = 0;
        this.dispatchErrorEvent(message);
    }

    clearError() {
        this.errorMessage = '';
    }

    // Parent communication methods
    dispatchSuccessEvent(result) {
        const successEvent = new CustomEvent('searchsuccess', {
            detail: {
                componentName: 'abnLookupTestV2',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                resultCount: this.totalRecords,
                result: result,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('searcherror', {
            detail: {
                componentName: 'abnLookupTestV2',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                errorMessage: errorMessage,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    // Public API methods for parent components
    @api
    performExternalSearch(searchTerm, searchType) {
        this.searchTerm = searchTerm;
        this.searchType = searchType || 'name';
        this.performSearch();
    }

    @api
    clearResults() {
        this.searchResults = [];
        this.totalRecords = 0;
        this.currentPage = 1;
        this.clearError();
    }

    @api
    getSelectedResults() {
        return this.searchResults;
    }

    @api
    validateComponent() {
        return this.validateSearch();
    }
}
