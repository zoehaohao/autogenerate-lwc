import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/TestabnLookupV2Controller.searchABN';

export default class TestabnLookupV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';
    @track currentPage = 1;
    @track totalRecords = 0;
    @track pageSize = 10;

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
        return this.searchType === 'name' ? 'Search' : 'Verify';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    get hasResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length > 0 && !this.selectedResult;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length === 0 && this.searchTerm && this.searchTerm.length >= 2;
    }

    get showPagination() {
        return this.totalRecords > this.pageSize;
    }

    get startRecord() {
        return ((this.currentPage - 1) * this.pageSize) + 1;
    }

    get endRecord() {
        return Math.min(this.currentPage * this.pageSize, this.totalRecords);
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

    get pageNumbers() {
        const pages = [];
        const totalPages = this.totalPages;
        const currentPage = this.currentPage;
        
        // Show first page
        if (currentPage > 3) {
            pages.push({
                label: '1',
                value: 1,
                variant: 'neutral'
            });
            if (currentPage > 4) {
                pages.push({
                    label: '...',
                    value: null,
                    variant: 'neutral'
                });
            }
        }
        
        // Show pages around current page
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            pages.push({
                label: i.toString(),
                value: i,
                variant: i === currentPage ? 'brand' : 'neutral'
            });
        }
        
        // Show last page
        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                pages.push({
                    label: '...',
                    value: null,
                    variant: 'neutral'
                });
            }
            pages.push({
                label: totalPages.toString(),
                value: totalPages,
                variant: 'neutral'
            });
        }
        
        return pages;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearResults();
    }

    detectSearchType() {
        const term = this.searchTerm.trim();
        if (/^\d{11}$/.test(term)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(term)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }

    async handleSearch() {
        if (!this.validateInput()) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.currentPage = 1;

        try {
            const result = await searchABN({
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                pageNumber: this.currentPage,
                pageSize: this.pageSize
            });

            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSearchEvent('success', result.data);
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.dispatchSearchEvent('error', { message: this.errorMessage });
            }
        } catch (error) {
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.dispatchSearchEvent('error', { message: this.errorMessage });
        } finally {
            this.isLoading = false;
        }
    }

    validateInput() {
        const term = this.searchTerm.trim();
        
        if (!term) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }

        if (this.searchType === 'abn' && !/^\d{11}$/.test(term)) {
            this.errorMessage = 'ABN must be exactly 11 digits';
            return false;
        }

        if (this.searchType === 'acn' && !/^\d{9}$/.test(term)) {
            this.errorMessage = 'ACN must be exactly 9 digits';
            return false;
        }

        if (this.searchType === 'name' && term.length < 2) {
            this.errorMessage = 'Company name must be at least 2 characters';
            return false;
        }

        return true;
    }

    processSearchResults(data) {
        if (data && data.results) {
            this.searchResults = data.results.map((result, index) => ({
                id: `result-${index}`,
                abnNumber: result.abn?.identifier_value || 'N/A',
                entityName: result.other_trading_name?.organisation_name || 'N/A',
                abnStatus: this.formatAbnStatus(result.entity_status),
                entityType: result.entity_type?.entity_description || 'N/A',
                gstStatus: this.formatGstStatus(result.goods_and_services_tax),
                businessLocation: result.main_business_location || 'N/A',
                rawData: result
            }));
            this.totalRecords = data.totalRecords || this.searchResults.length;
        } else {
            this.searchResults = [];
            this.totalRecords = 0;
        }
    }

    formatAbnStatus(entityStatus) {
        if (entityStatus && entityStatus.entity_status_code) {
            const status = entityStatus.entity_status_code;
            const effectiveFrom = entityStatus.effective_from;
            if (effectiveFrom && effectiveFrom !== '0001-01-01') {
                return `${status} from ${this.formatDate(effectiveFrom)}`;
            }
            return status;
        }
        return 'N/A';
    }

    formatGstStatus(gstInfo) {
        if (gstInfo && gstInfo.effective_from && gstInfo.effective_from !== '0001-01-01') {
            return `Registered from ${this.formatDate(gstInfo.effective_from)}`;
        }
        return 'Not registered';
    }

    formatDate(dateString) {
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

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.searchResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = { ...selected };
            this.dispatchSelectionEvent(selected);
        }
    }

    handleChangeAbn() {
        this.selectedResult = null;
        this.clearResults();
    }

    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page, 10);
        if (pageNumber && pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
            this.handleSearch();
        }
    }

    handlePreviousPage() {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.handleSearch();
        }
    }

    handleNextPage() {
        if (!this.isLastPage) {
            this.currentPage++;
            this.handleSearch();
        }
    }

    clearResults() {
        this.searchResults = [];
        this.errorMessage = '';
        this.totalRecords = 0;
        this.currentPage = 1;
    }

    // Parent communication methods
    dispatchSearchEvent(type, data) {
        const eventDetail = {
            componentName: 'TestabnLookupV2',
            searchTerm: this.searchTerm,
            searchType: this.searchType,
            timestamp: new Date().toISOString()
        };

        if (type === 'success') {
            eventDetail.results = data;
            eventDetail.resultCount = this.searchResults.length;
        } else if (type === 'error') {
            eventDetail.error = data;
        }

        this.dispatchEvent(new CustomEvent('search', {
            detail: eventDetail,
            bubbles: true,
            composed: true
        }));
    }

    dispatchSelectionEvent(selectedData) {
        const selectionEvent = new CustomEvent('selection', {
            detail: {
                componentName: 'TestabnLookupV2',
                selectedResult: selectedData,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
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
        this.selectedResult = null;
        this.clearResults();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    validateComponent() {
        return this.selectedResult !== null;
    }
}
