import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    // Public API properties for parent component configuration
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;
    @api pageSize = 10;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track currentPage = 1;
    @track searchType = '';

    // Constants
    SEARCH_TYPES = {
        ABN: 'abn',
        ACN: 'acn',
        COMPANY_NAME: 'companyName'
    };

    // Lifecycle hooks
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
        }
    }

    // Getters for dynamic content
    get searchPlaceholder() {
        switch (this.searchType) {
            case this.SEARCH_TYPES.ABN:
                return 'Enter 11-digit ABN number';
            case this.SEARCH_TYPES.ACN:
                return 'Enter 9-digit ACN number';
            case this.SEARCH_TYPES.COMPANY_NAME:
                return 'Enter company name';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchButtonLabel() {
        return this.searchType === this.SEARCH_TYPES.ABN ? 'Verify' : 'Search';
    }

    get searchDescription() {
        if (this.searchType === this.SEARCH_TYPES.ABN) {
            return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
        }
        return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
    }

    get isSearchDisabled() {
        return this.isLoading || this.isReadOnly || !this.searchTerm || !this.isValidInput;
    }

    get isValidInput() {
        if (!this.searchTerm) return false;
        
        const trimmedTerm = this.searchTerm.trim();
        
        // ABN validation (11 digits)
        if (/^\d{11}$/.test(trimmedTerm)) {
            return true;
        }
        
        // ACN validation (9 digits)
        if (/^\d{9}$/.test(trimmedTerm)) {
            return true;
        }
        
        // Company name validation (minimum 2 characters)
        if (trimmedTerm.length >= 2 && /^[a-zA-Z0-9\s&.-]+$/.test(trimmedTerm)) {
            return true;
        }
        
        return false;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && this.searchResults.length === 0 && this.searchTerm;
    }

    get totalPages() {
        return Math.ceil(this.searchResults.length / this.pageSize);
    }

    get showPagination() {
        return this.hasResults && this.totalPages > 1;
    }

    get paginatedResults() {
        if (!this.hasResults) return [];
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.searchResults.slice(startIndex, endIndex);
    }

    get paginationInfo() {
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.searchResults.length);
        return {
            start: start,
            end: end,
            total: this.searchResults.length
        };
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

    get isPreviousDisabled() {
        return this.currentPage <= 1;
    }

    get isNextDisabled() {
        return this.currentPage >= this.totalPages;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearResults();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13 && !this.isSearchDisabled) {
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (!this.isValidInput) {
            this.showError('Please enter a valid ABN (11 digits), ACN (9 digits), or company name (minimum 2 characters).');
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
                this.dispatchSuccessEvent(result.data);
            } else {
                this.showError(result.message || 'Search failed. Please try again.');
                this.dispatchErrorEvent(result.message);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('An unexpected error occurred. Please try again.');
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

    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page);
        this.currentPage = pageNumber;
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    // Helper methods
    detectSearchType() {
        const trimmedTerm = this.searchTerm.trim();
        
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = this.SEARCH_TYPES.ABN;
        } else if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = this.SEARCH_TYPES.ACN;
        } else {
            this.searchType = this.SEARCH_TYPES.COMPANY_NAME;
        }
    }

    processSearchResults(data) {
        if (!data) {
            this.searchResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((item, index) => ({
            id: `result-${index}`,
            abnNumber: this.extractABNNumber(item),
            entityName: this.extractEntityName(item),
            abnStatus: this.extractABNStatus(item),
            entityType: this.extractEntityType(item),
            gstStatus: this.extractGSTStatus(item),
            businessLocation: this.extractBusinessLocation(item),
            rawData: item
        }));
    }

    extractABNNumber(data) {
        return data.abn?.identifier_value || data.abnNumber || 'N/A';
    }

    extractEntityName(data) {
        return data.other_trading_name?.organisation_name || 
               data.entityName || 
               data.entity_name || 
               'N/A';
    }

    extractABNStatus(data) {
        const status = data.entity_status?.entity_status_code || data.abnStatus;
        const effectiveFrom = data.entity_status?.effective_from;
        
        if (status && effectiveFrom) {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status || 'N/A';
    }

    extractEntityType(data) {
        return data.entity_type?.entity_description || 
               data.entityType || 
               'N/A';
    }

    extractGSTStatus(data) {
        const gstData = data.goods_and_services_tax;
        if (gstData?.effective_from) {
            return `Registered from ${this.formatDate(gstData.effective_from)}`;
        }
        return data.gstStatus || 'N/A';
    }

    extractBusinessLocation(data) {
        return data.businessLocation || data.main_business_location || 'N/A';
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

    showError(message) {
        this.errorMessage = message;
        this.searchResults = [];
    }

    clearError() {
        this.errorMessage = '';
    }

    clearResults() {
        this.searchResults = [];
        this.currentPage = 1;
        this.clearError();
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm) {
            this.handleSearch();
        }
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.clearResults();
        this.searchType = '';
    }

    @api
    validateComponent() {
        return {
            isValid: this.isValidInput,
            searchTerm: this.searchTerm,
            searchType: this.searchType,
            hasResults: this.hasResults
        };
    }

    // Custom events for parent communication
    dispatchSuccessEvent(data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'abnLookupTestV2',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                results: this.searchResults,
                resultCount: this.searchResults.length,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV2',
                errorMessage: error,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('selection', {
            detail: {
                componentName: 'abnLookupTestV2',
                selectedResult: selectedResult,
                searchTerm: this.searchTerm,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectionEvent);
    }
}
