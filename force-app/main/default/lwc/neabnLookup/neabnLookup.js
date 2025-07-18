import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/neabnLookupController.searchABN';

export default class NeabnLookup extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name'; // 'abn', 'acn', 'name'
    @track currentPage = 1;
    @track totalPages = 1;
    @track totalRecords = 0;
    @track pageSize = 10;
    @track showSearchForm = true;

    // UI State getters
    get actionButtonLabel() {
        return this.selectedResult ? 'Change ABN' : 'Find ABN';
    }

    get searchDescription() {
        if (this.selectedResult) {
            return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
        }
        return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
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
        return this.selectedResult ? 'Verify' : 'Search';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.isValidSearchTerm;
    }

    get isValidSearchTerm() {
        if (!this.searchTerm || this.searchTerm.trim().length < 2) {
            return false;
        }

        const trimmedTerm = this.searchTerm.trim();
        
        // ABN validation (11 digits)
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = 'abn';
            return true;
        }
        
        // ACN validation (9 digits)
        if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = 'acn';
            return true;
        }
        
        // Company name validation (minimum 2 characters)
        if (trimmedTerm.length >= 2) {
            this.searchType = 'name';
            return true;
        }
        
        return false;
    }

    get hasResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length === 0 && this.searchTerm;
    }

    get showPagination() {
        return this.hasResults && this.totalPages > 1;
    }

    get paginationInfo() {
        const startRecord = ((this.currentPage - 1) * this.pageSize) + 1;
        const endRecord = Math.min(this.currentPage * this.pageSize, this.totalRecords);
        return {
            startRecord,
            endRecord,
            totalRecords: this.totalRecords
        };
    }

    get pageNumbers() {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push({
                value: i,
                label: i.toString(),
                variant: i === this.currentPage ? 'brand' : 'neutral'
            });
        }
        return pages;
    }

    get isFirstPage() {
        return this.currentPage <= 1;
    }

    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

    // Event Handlers
    handleActionButtonClick() {
        if (this.selectedResult) {
            this.handleChangeAbn();
        } else {
            this.showSearchForm = true;
        }
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    async handleSearch() {
        if (!this.isValidSearchTerm) {
            this.errorMessage = 'Please enter a valid search term';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];
        this.currentPage = 1;

        try {
            const result = await searchABN({
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType,
                pageNumber: this.currentPage,
                pageSize: this.pageSize
            });

            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSearchEvent('success', result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.dispatchSearchEvent('error', { message: this.errorMessage });
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchSearchEvent('error', { message: this.errorMessage });
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (data && data.results) {
            this.searchResults = data.results.map((result, index) => ({
                id: `result-${index}`,
                abnNumber: result.abnNumber || '',
                entityName: result.entityName || '',
                abnStatus: result.abnStatus || '',
                entityType: result.entityType || '',
                gstStatus: result.gstStatus || '',
                mainBusinessLocation: result.mainBusinessLocation || '',
                rawData: result
            }));
            
            this.totalRecords = data.totalRecords || this.searchResults.length;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        } else {
            this.searchResults = [];
            this.totalRecords = 0;
            this.totalPages = 1;
        }
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.searchResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = { ...selected };
            this.showSearchForm = false;
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(this.selectedResult);
        }
    }

    handleChangeAbn() {
        this.selectedResult = null;
        this.showSearchForm = true;
        this.searchResults = [];
        this.searchTerm = '';
        this.errorMessage = '';
        
        // Dispatch change event to parent
        this.dispatchChangeEvent();
    }

    // Pagination handlers
    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.handleSearch();
        }
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.handleSearch();
        }
    }

    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page, 10);
        if (pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
            this.handleSearch();
        }
    }

    // Parent Communication Methods
    dispatchSearchEvent(type, data) {
        const searchEvent = new CustomEvent('search', {
            detail: {
                componentName: 'neabnLookup',
                type: type,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                data: data,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(searchEvent);
    }

    dispatchSelectionEvent(selectedData) {
        const selectionEvent = new CustomEvent('abnselected', {
            detail: {
                componentName: 'neabnLookup',
                selectedResult: selectedData,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchChangeEvent() {
        const changeEvent = new CustomEvent('abnchanged', {
            detail: {
                componentName: 'neabnLookup',
                action: 'cleared',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    // Public API Methods
    @api
    refreshData() {
        if (this.searchTerm && this.isValidSearchTerm) {
            this.handleSearch();
        }
    }

    @api
    validateComponent() {
        return {
            isValid: this.selectedResult !== null,
            selectedResult: this.selectedResult,
            message: this.selectedResult ? 'ABN selected' : 'No ABN selected'
        };
    }

    @api
    clearSelection() {
        this.handleChangeAbn();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }
}
