import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupV3Controller.searchABN';

export default class AbnLookupV3 extends LightningElement {
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
    @track componentMode = 'search'; // 'search' or 'readonly'
    
    // Computed properties
    get isSearchMode() {
        return this.componentMode === 'search' && !this.selectedEntity;
    }
    
    get isReadOnlyMode() {
        return this.componentMode === 'readonly' || (this.selectedEntity && this.isReadOnly);
    }
    
    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading;
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
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
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
        if (!this.validateInput()) {
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
                this.processSearchResults(result.data);
                this.totalResults = result.totalCount || result.data.length;
                
                if (this.searchResults.length === 0) {
                    this.errorMessage = `No matching results for ${this.searchTerm}, please check the inputs and try again.`;
                }
            } else {
                this.errorMessage = result.message || 'An error occurred during search. Please try again.';
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.notifyParentError(error);
        } finally {
            this.isLoading = false;
        }
    }
    
    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selected = this.searchResults.find(result => result.id === selectedId);
        
        if (selected) {
            this.selectedEntity = { ...selected };
            this.componentMode = 'readonly';
            this.notifyParentSelection(this.selectedEntity);
        }
    }
    
    handleChangeABN() {
        this.selectedEntity = null;
        this.componentMode = 'search';
        this.searchResults = [];
        this.searchTerm = '';
        this.currentPage = 1;
        this.totalResults = 0;
        this.clearError();
        
        this.notifyParentChange();
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
        const pageNumber = parseInt(event.target.dataset.page, 10);
        this.currentPage = pageNumber;
    }
    
    // Validation methods
    validateInput() {
        const trimmedTerm = this.searchTerm.trim();
        
        if (!trimmedTerm) {
            this.errorMessage = 'Please enter a search term.';
            return false;
        }
        
        // Check if it's a numeric input (ABN or ACN)
        if (/^\d+$/.test(trimmedTerm)) {
            if (trimmedTerm.length === 11) {
                // Valid ABN length
                return true;
            } else if (trimmedTerm.length === 9) {
                // Valid ACN length
                return true;
            } else {
                this.errorMessage = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
                return false;
            }
        }
        
        // For business names, accept any non-empty string
        return true;
    }
    
    // Data processing methods
    processSearchResults(data) {
        if (Array.isArray(data)) {
            this.searchResults = data.map(item => ({
                ...item,
                formattedABN: this.formatABN(item.ABN)
            }));
        } else {
            this.searchResults = [];
        }
    }
    
    formatABN(abn) {
        if (!abn) return '';
        const abnString = abn.toString().padStart(11, '0');
        return `${abnString.substring(0, 2)} ${abnString.substring(2, 5)} ${abnString.substring(5, 8)} ${abnString.substring(8, 11)}`;
    }
    
    clearError() {
        this.errorMessage = '';
    }
    
    // Parent communication methods
    notifyParentSelection(selectedEntity) {
        const selectionEvent = new CustomEvent('entityselected', {
            detail: {
                componentName: 'abnLookupV3',
                selectedEntity: selectedEntity,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }
    
    notifyParentChange() {
        const changeEvent = new CustomEvent('entitychanged', {
            detail: {
                componentName: 'abnLookupV3',
                action: 'cleared',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }
    
    notifyParentError(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupV3',
                errorMessage: error.message || 'An error occurred',
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
        this.handleSearch();
    }
    
    @api
    clearSelection() {
        this.handleChangeABN();
    }
    
    @api
    validateComponent() {
        return this.selectedEntity !== null;
    }
    
    @api
    getSelectedEntity() {
        return this.selectedEntity;
    }
}
