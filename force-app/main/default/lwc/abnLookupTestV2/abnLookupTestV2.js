import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
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
    @track hasSearched = false;
    
    // Computed properties for UI state
    get isSearchMode() {
        return !this.selectedEntity;
    }
    
    get isReadOnlyMode() {
        return this.selectedEntity !== null;
    }
    
    get hasResults() {
        return this.searchResults.length > 0 && this.hasSearched && !this.isLoading;
    }
    
    get showNoResults() {
        return this.searchResults.length === 0 && this.hasSearched && !this.isLoading && this.searchTerm;
    }
    
    get currentPageResults() {
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
        return (this.currentPage - 1) * this.pageSize + 1;
    }
    
    get endRecord() {
        const end = this.currentPage * this.pageSize;
        return end > this.totalResults ? this.totalResults : end;
    }
    
    get pageNumbers() {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push({
                label: i.toString(),
                value: i,
                variant: i === this.currentPage ? 'brand' : 'neutral'
            });
        }
        return pages;
    }
    
    get resultCardClass() {
        // Responsive grid classes based on screen size
        return 'slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3 slds-x-large-size_1-of-4';
    }
    
    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.clearError();
    }
    
    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }
    
    async handleSearch() {
        if (!this.searchTerm.trim()) {
            this.setError('Please enter a search term');
            return;
        }
        
        if (!this.validateInput(this.searchTerm.trim())) {
            return;
        }
        
        this.isLoading = true;
        this.clearError();
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
                
                // Dispatch search event to parent
                this.dispatchSearchEvent('search_completed', {
                    searchTerm: this.searchTerm,
                    resultCount: this.totalResults
                });
            } else {
                this.setError(result.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.setError('An error occurred while searching. Please try again.');
            this.dispatchErrorEvent(error);
        } finally {
            this.isLoading = false;
        }
    }
    
    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selected = this.searchResults.find(result => result.id === selectedId);
        
        if (selected) {
            this.selectedEntity = { ...selected };
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent('entity_selected', {
                selectedEntity: this.selectedEntity,
                searchTerm: this.searchTerm
            });
        }
    }
    
    handleChangeABN() {
        this.selectedEntity = null;
        this.searchResults = [];
        this.searchTerm = '';
        this.hasSearched = false;
        this.clearError();
        
        // Dispatch change event to parent
        this.dispatchSelectionEvent('selection_cleared', {
            previousEntity: this.selectedEntity
        });
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
        const pageNumber = parseInt(event.target.dataset.page);
        this.currentPage = pageNumber;
    }
    
    // Validation methods
    validateInput(input) {
        const trimmedInput = input.trim();
        
        // Check if it's a numeric input (ABN or ACN)
        if (/^\d+$/.test(trimmedInput)) {
            if (trimmedInput.length === 11) {
                // Valid ABN length
                return true;
            } else if (trimmedInput.length === 9) {
                // Valid ACN length
                return true;
            } else {
                this.setError('An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again');
                return false;
            }
        }
        
        // Non-numeric input (business name) - allow any non-empty string
        return trimmedInput.length > 0;
    }
    
    // Utility methods
    setError(message) {
        this.errorMessage = message;
    }
    
    clearError() {
        this.errorMessage = '';
    }
    
    // Parent communication methods
    dispatchSelectionEvent(eventType, detail) {
        const selectionEvent = new CustomEvent('abnselection', {
            detail: {
                componentName: 'abnLookupTestV2',
                eventType: eventType,
                ...detail,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }
    
    dispatchSearchEvent(eventType, detail) {
        const searchEvent = new CustomEvent('abnsearch', {
            detail: {
                componentName: 'abnLookupTestV2',
                eventType: eventType,
                ...detail,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(searchEvent);
    }
    
    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV2',
                errorMessage: error.message || 'Unknown error occurred',
                errorCode: error.code,
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
            this.handleSearch();
        }
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
