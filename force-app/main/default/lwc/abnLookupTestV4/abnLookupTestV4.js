import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV4Controller.searchABN';

export default class AbnLookupTestV4 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    @api pageSize = 10;

    @track searchTerm = '';
    @track searchResults = [];
    @track selectedEntity = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentPage = 1;
    @track totalResults = 0;
    @track isSearchMode = true;

    // Computed properties
    get isReadOnlyMode() {
        return !this.isSearchMode && this.selectedEntity !== null;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading;
    }

    get showNoResults() {
        return this.searchResults && this.searchResults.length === 0 && !this.isLoading && this.searchTerm;
    }

    get showPagination() {
        return this.totalResults > this.pageSize;
    }

    get totalPages() {
        return Math.ceil(this.totalResults / this.pageSize);
    }

    get paginatedResults() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.searchResults.slice(startIndex, endIndex);
    }

    get resultCountText() {
        const startIndex = (this.currentPage - 1) * this.pageSize + 1;
        const endIndex = Math.min(this.currentPage * this.pageSize, this.totalResults);
        return `Showing ${startIndex}-${endIndex} of ${this.totalResults} results`;
    }

    get isPreviousDisabled() {
        return this.currentPage <= 1;
    }

    get isNextDisabled() {
        return this.currentPage >= this.totalPages;
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
                label: i.toString(),
                value: i,
                variant: i === this.currentPage ? 'brand' : 'neutral'
            });
        }
        return pages;
    }

    get searchButtonClass() {
        return window.innerWidth <= 767 ? 'slds-size_1-of-1' : '';
    }

    get resultCardClass() {
        return 'slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3 slds-x-large-size_1-of-4';
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) {
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            this.errorMessage = 'Please enter a search term';
            return;
        }

        // Validate input format
        const trimmedTerm = this.searchTerm.trim();
        const numericTerm = trimmedTerm.replace(/\s/g, '');
        
        if (/^\d+$/.test(numericTerm)) {
            if (numericTerm.length === 11) {
                // Valid ABN
            } else if (numericTerm.length === 9) {
                // Valid ACN
            } else {
                this.errorMessage = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
                return;
            }
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.currentPage = 1;

        try {
            const result = await searchABN({ searchTerm: this.searchTerm });
            
            if (result.success) {
                this.searchResults = this.processSearchResults(result.data);
                this.totalResults = this.searchResults.length;
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.searchResults = [];
                this.totalResults = 0;
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An error occurred while searching. Please try again.';
            this.searchResults = [];
            this.totalResults = 0;
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        return data.map(item => ({
            ...item,
            formattedABN: this.formatABN(item.ABN)
        }));
    }

    formatABN(abn) {
        const abnString = abn.toString().padStart(11, '0');
        return `${abnString.substring(0, 2)} ${abnString.substring(2, 5)} ${abnString.substring(5, 8)} ${abnString.substring(8, 11)}`;
    }

    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selected = this.searchResults.find(item => item.id === selectedId);
        
        if (selected) {
            this.selectedEntity = selected;
            this.isSearchMode = false;
            
            // Dispatch custom event to parent
            const selectionEvent = new CustomEvent('entityselected', {
                detail: {
                    componentName: 'abnLookupTestV4',
                    selectedEntity: selected,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);

            // Dispatch success event
            const successEvent = new CustomEvent('success', {
                detail: {
                    componentName: 'abnLookupTestV4',
                    result: selected,
                    message: 'Entity selected successfully',
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(successEvent);
        }
    }

    handleChangeABN() {
        this.isSearchMode = true;
        this.selectedEntity = null;
        this.searchTerm = '';
        this.searchResults = [];
        this.errorMessage = '';
        this.currentPage = 1;
        this.totalResults = 0;
    }

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
        const pageNumber = parseInt(event.target.dataset.page, 10);
        this.currentPage = pageNumber;
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.handleSearch();
    }

    @api
    validateComponent() {
        return this.selectedEntity !== null;
    }

    @api
    clearSelection() {
        this.handleChangeABN();
    }

    @api
    getSelectedEntity() {
        return this.selectedEntity;
    }
}
