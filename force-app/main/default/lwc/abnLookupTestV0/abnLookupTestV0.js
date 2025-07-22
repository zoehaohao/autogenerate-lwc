import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV0Controller.searchABN';

export default class AbnLookupTestV0 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    @api pageSize = 10;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track selectedEntity = null;
    @track currentPage = 1;
    @track totalResults = 0;
    @track isLoading = false;
    @track errorMessage = '';
    @track validationError = '';
    @track hasSearched = false;
    
    // Component state management
    get isSearchMode() {
        return !this.selectedEntity && !this.isReadOnly;
    }
    
    get isReadOnlyMode() {
        return this.selectedEntity !== null || this.isReadOnly;
    }
    
    get hasResults() {
        return this.searchResults.length > 0 && this.hasSearched && !this.isLoading;
    }
    
    get showNoResults() {
        return this.searchResults.length === 0 && this.hasSearched && !this.isLoading && !this.errorMessage;
    }
    
    get showPagination() {
        return this.totalResults > this.pageSize;
    }
    
    // Pagination calculations
    get totalPages() {
        return Math.ceil(this.totalResults / this.pageSize);
    }
    
    get startRecord() {
        return (this.currentPage - 1) * this.pageSize + 1;
    }
    
    get endRecord() {
        const end = this.currentPage * this.pageSize;
        return end > this.totalResults ? this.totalResults : end;
    }
    
    get paginatedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.searchResults.slice(start, end).map(result => ({
            ...result,
            formattedABN: this.formatABN(result.ABN)
        }));
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
        const current = this.currentPage;
        
        // Show up to 5 page numbers
        let start = Math.max(1, current - 2);
        let end = Math.min(totalPages, start + 4);
        
        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }
        
        for (let i = start; i <= end; i++) {
            pages.push({
                number: i,
                label: i.toString(),
                variant: i === current ? 'brand' : 'neutral'
            });
        }
        
        return pages;
    }
    
    // Responsive CSS classes
    get resultCardClass() {
        return 'slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3 slds-x-large-size_1-of-4';
    }
    
    get searchButtonClass() {
        return 'search-button slds-size_1-of-1 slds-medium-size_auto';
    }
    
    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.validationError = '';
        this.errorMessage = '';
    }
    
    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }
    
    handleSearch() {
        if (!this.validateInput()) {
            return;
        }
        
        this.performSearch();
    }
    
    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selected = this.searchResults.find(result => result.id === selectedId);
        
        if (selected) {
            this.selectedEntity = {
                ...selected,
                formattedABN: this.formatABN(selected.ABN)
            };
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(selected);
        }
    }
    
    handleChangeABN() {
        this.selectedEntity = null;
        this.searchTerm = '';
        this.searchResults = [];
        this.hasSearched = false;
        this.currentPage = 1;
        this.errorMessage = '';
        this.validationError = '';
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
                this.validationError = '';
                return true;
            } else if (trimmedTerm.length === 9) {
                // Valid ACN length
                this.validationError = '';
                return true;
            } else {
                this.validationError = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
                return false;
            }
        }
        
        // Non-numeric input (business name) - allow any non-empty string
        this.validationError = '';
        return true;
    }
    
    // API integration
    async performSearch() {
        this.isLoading = true;
        this.errorMessage = '';
        this.currentPage = 1;
        
        try {
            const result = await searchABN({ 
                searchTerm: this.searchTerm.trim(),
                pageSize: this.pageSize,
                pageNumber: this.currentPage
            });
            
            if (result.success) {
                this.searchResults = result.data || [];
                this.totalResults = this.searchResults.length;
                this.hasSearched = true;
                
                // Dispatch success event
                this.dispatchSuccessEvent(result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.searchResults = [];
                this.totalResults = 0;
                this.hasSearched = true;
                
                // Dispatch error event
                this.dispatchErrorEvent(result.message);
            }
        } catch (error) {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.searchResults = [];
            this.totalResults = 0;
            this.hasSearched = true;
            
            // Dispatch error event
            this.dispatchErrorEvent(error.message);
        } finally {
            this.isLoading = false;
        }
    }
    
    // Utility methods
    formatABN(abn) {
        if (!abn) return '';
        const abnString = abn.toString();
        if (abnString.length === 11) {
            return `${abnString.substring(0, 2)} ${abnString.substring(2, 5)} ${abnString.substring(5, 8)} ${abnString.substring(8, 11)}`;
        }
        return abnString;
    }
    
    // Event dispatching methods
    dispatchSelectionEvent(selectedData) {
        const selectionEvent = new CustomEvent('abnselection', {
            detail: {
                componentName: 'abnLookupTestV0',
                selectedEntity: selectedData,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }
    
    dispatchSuccessEvent(data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'abnLookupTestV0',
                result: data,
                message: 'Search completed successfully',
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
                componentName: 'abnLookupTestV0',
                errorMessage: errorMessage,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
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
        return this.validateInput();
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
