import { LightningElement, api, track } from 'lwc';
import searchAbnEntities from '@salesforce/apex/abnLookupTestV2Controller.searchAbnEntities';
import verifyAbnEntity from '@salesforce/apex/abnLookupTestV2Controller.verifyAbnEntity';

export default class AbnLookupTestV2 extends LightningElement {
    @api mode = 'Search'; // 'Search' or 'Verify'
    @api pageSize = 10;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track selectedEntity = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentPage = 1;
    @track totalResults = 0;
    @track hasSearched = false;

    // Computed properties for UI state
    get isSearchMode() {
        return this.mode === 'Search';
    }

    get isVerifyMode() {
        return this.mode === 'Verify';
    }

    get modeButtonLabel() {
        return this.isSearchMode ? 'Find ABN' : 'Find ABN';
    }

    get modeDescription() {
        if (this.isSearchMode) {
            return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
        }
        return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
    }

    get searchPlaceholder() {
        return this.isSearchMode ? 'Search by Business name, ABN or ACN' : 'Enter ABN or ACN';
    }

    get searchButtonLabel() {
        return this.isSearchMode ? 'Search' : 'Verify';
    }

    get selectButtonLabel() {
        return this.isSearchMode ? 'Select' : 'Confirm';
    }

    get showSelectedEntity() {
        return this.selectedEntity !== null;
    }

    get showSearchInterface() {
        return this.selectedEntity === null;
    }

    get showResults() {
        return this.hasSearched && !this.isLoading && this.searchResults.length > 0 && !this.errorMessage;
    }

    get showNoResults() {
        return this.hasSearched && !this.isLoading && this.searchResults.length === 0 && !this.errorMessage;
    }

    get paginatedResults() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.searchResults.slice(startIndex, endIndex);
    }

    get totalPages() {
        return Math.ceil(this.searchResults.length / this.pageSize);
    }

    get showPagination() {
        return this.totalPages > 1;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get startRecord() {
        return this.searchResults.length > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
    }

    get endRecord() {
        const end = this.currentPage * this.pageSize;
        return end > this.searchResults.length ? this.searchResults.length : end;
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

    get resultCardClass() {
        return 'slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3';
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    handleSearch() {
        if (!this.searchTerm.trim()) {
            this.errorMessage = 'Please enter a search term';
            return;
        }

        // Validate input format
        const trimmedTerm = this.searchTerm.trim();
        const isNumeric = /^\d+$/.test(trimmedTerm);
        
        if (isNumeric) {
            if (trimmedTerm.length !== 11 && trimmedTerm.length !== 9) {
                this.errorMessage = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
                return;
            }
        }

        this.performSearch();
    }

    async performSearch() {
        this.isLoading = true;
        this.errorMessage = '';
        this.hasSearched = false;
        this.currentPage = 1;

        try {
            let result;
            if (this.isSearchMode) {
                result = await searchAbnEntities({ 
                    searchTerm: this.searchTerm.trim(),
                    pageSize: this.pageSize,
                    pageNumber: this.currentPage
                });
            } else {
                result = await verifyAbnEntity({ 
                    abnOrAcn: this.searchTerm.trim()
                });
            }

            if (result.success) {
                this.searchResults = this.processSearchResults(result.data);
                this.totalResults = this.searchResults.length;
                this.hasSearched = true;
            } else {
                this.errorMessage = result.message || 'An error occurred while searching';
                this.searchResults = [];
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.searchResults = [];
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data) return [];
        
        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map((item, index) => {
            const abn = item.abn?.identifier_value || '';
            const entityName = item.entity_name || item.other_trading_name?.organisation_name || 'N/A';
            const status = item.entity_status?.entity_status_code || 'Unknown';
            const entityType = item.entity_type?.entity_description || 'N/A';
            const gstStatus = item.goods_and_services_tax ? 'Registered' : 'Not Registered';
            const location = item.main_business_location || 'N/A';

            return {
                id: `${abn}-${index}`,
                abn: abn,
                formattedAbn: this.formatAbn(abn),
                entityName: entityName,
                status: status,
                entityType: entityType,
                gstStatus: gstStatus,
                location: location,
                rawData: item
            };
        });
    }

    formatAbn(abn) {
        if (!abn || abn.length !== 11) return abn;
        return `${abn.substring(0, 2)} ${abn.substring(2, 5)} ${abn.substring(5, 8)} ${abn.substring(8, 11)}`;
    }

    handleSelectEntity(event) {
        const selectedId = event.target.dataset.id;
        const entity = this.searchResults.find(result => result.id === selectedId);
        
        if (entity) {
            this.selectedEntity = entity;
            this.dispatchSelectionEvent(entity);
        }
    }

    handleChangeAbn() {
        this.selectedEntity = null;
        this.searchResults = [];
        this.searchTerm = '';
        this.hasSearched = false;
        this.errorMessage = '';
        this.currentPage = 1;
    }

    // Pagination handlers
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

    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page, 10);
        this.currentPage = pageNumber;
    }

    // Parent communication
    dispatchSelectionEvent(entity) {
        const selectionEvent = new CustomEvent('entityselected', {
            detail: {
                componentName: 'abnLookupTestV2',
                selectedEntity: entity,
                mode: this.mode,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    // Public API methods for parent components
    @api
    clearSelection() {
        this.handleChangeAbn();
    }

    @api
    getSelectedEntity() {
        return this.selectedEntity;
    }

    @api
    setMode(newMode) {
        if (newMode === 'Search' || newMode === 'Verify') {
            this.mode = newMode;
            this.handleChangeAbn(); // Reset component state
        }
    }
}
