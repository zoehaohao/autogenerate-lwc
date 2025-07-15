import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track selectedEntity = null;
    @track currentPage = 1;
    @track pageSize = 10;
    @track totalResults = 0;
    @track isLoading = false;
    @track errorMessage = '';
    @track validationError = '';
    @track componentState = 'search'; // search, loading, results, selected, error, empty
    
    // Computed properties
    get isSearchMode() {
        return this.componentState === 'search';
    }
    
    get showResults() {
        return this.componentState === 'results' && this.searchResults.length > 0;
    }
    
    get isSelectedMode() {
        return this.componentState === 'selected';
    }
    
    get showEmptyState() {
        return this.componentState === 'empty';
    }
    
    get paginatedResults() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.searchResults.slice(startIndex, endIndex);
    }
    
    get totalPages() {
        return Math.ceil(this.totalResults / this.pageSize);
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
        return ((this.currentPage - 1) * this.pageSize) + 1;
    }
    
    get endRecord() {
        const end = this.currentPage * this.pageSize;
        return end > this.totalResults ? this.totalResults : end;
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
        this.validationError = '';
    }
    
    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }
    
    async handleSearch() {
        if (!this.validateInput()) {
            return;
        }
        
        this.isLoading = true;
        this.componentState = 'loading';
        this.errorMessage = '';
        this.currentPage = 1;
        
        try {
            const result = await searchABN({
                searchTerm: this.searchTerm,
                pageNumber: this.currentPage,
                pageSize: this.pageSize
            });
            
            if (result.success) {
                this.searchResults = this.processSearchResults(result.data.results || []);
                this.totalResults = result.data.totalCount || 0;
                
                if (this.searchResults.length > 0) {
                    this.componentState = 'results';
                } else {
                    this.componentState = 'empty';
                }
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.componentState = 'error';
            }
        } catch (error) {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.componentState = 'error';
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
        }
    }
    
    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selected = this.searchResults.find(result => result.id === selectedId);
        
        if (selected) {
            this.selectedEntity = selected;
            this.componentState = 'selected';
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(selected);
        }
    }
    
    handleChangeAbn() {
        this.componentState = 'search';
        this.selectedEntity = null;
        this.searchResults = [];
        this.searchTerm = '';
        this.currentPage = 1;
        this.totalResults = 0;
    }
    
    handlePrevious() {
        if (!this.isFirstPage) {
            this.currentPage--;
        }
    }
    
    handleNext() {
        if (!this.isLastPage) {
            this.currentPage++;
        }
    }
    
    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page);
        this.currentPage = pageNumber;
    }
    
    handleRetry() {
        this.handleSearch();
    }
    
    // Validation methods
    validateInput() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            this.validationError = 'Please enter a search term';
            return false;
        }
        
        const trimmedTerm = this.searchTerm.trim();
        
        // Check if it's a numeric input (ABN or ACN)
        if (/^\d+$/.test(trimmedTerm)) {
            if (trimmedTerm.length === 11) {
                // Valid ABN length
                return true;
            } else if (trimmedTerm.length === 9) {
                // Valid ACN length
                return true;
            } else {
                this.validationError = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
                return false;
            }
        }
        
        // For business names, minimum length check
        if (trimmedTerm.length < 2) {
            this.validationError = 'Please enter at least 2 characters for business name search';
            return false;
        }
        
        return true;
    }
    
    // Data processing methods
    processSearchResults(results) {
        return results.map((result, index) => {
            return {
                id: `result-${index}`,
                abn: result.abn || '',
                formattedAbn: this.formatABN(result.abn || ''),
                entityName: result.entityName || 'N/A',
                businessName: result.businessName || '',
                status: result.status || 'N/A',
                entityType: result.entityType || 'N/A',
                gstStatus: result.gstStatus || 'N/A',
                location: result.location || 'N/A',
                rawData: result
            };
        });
    }
    
    formatABN(abn) {
        if (!abn || abn.length !== 11) {
            return abn;
        }
        return `${abn.substring(0, 2)} ${abn.substring(2, 5)} ${abn.substring(5, 8)} ${abn.substring(8, 11)}`;
    }
    
    // Parent communication methods
    dispatchSelectionEvent(selectedEntity) {
        const selectionEvent = new CustomEvent('abnselection', {
            detail: {
                componentName: 'abnLookupTestV2',
                selectedEntity: selectedEntity,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectionEvent);
    }
    
    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV2',
                errorMessage: error.message || error,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }
    
    // Public API methods for parent components
    @api
    refreshData() {
        this.handleChangeAbn();
    }
    
    @api
    validateComponent() {
        return this.selectedEntity !== null;
    }
    
    @api
    getSelectedEntity() {
        return this.selectedEntity;
    }
    
    @api
    clearSelection() {
        this.handleChangeAbn();
    }
}
