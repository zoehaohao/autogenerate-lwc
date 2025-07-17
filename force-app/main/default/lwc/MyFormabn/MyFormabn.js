import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/MyFormabnController.searchABN';

export default class MyFormabn extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    
    @track searchTerm = '';
    @track searchType = '';
    @track searchResults = [];
    @track allResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentPage = 1;
    @track pageSize = 10;
    
    // Computed properties
    get searchPlaceholder() {
        switch(this.searchType) {
            case 'ABN':
                return 'Enter 11-digit ABN number';
            case 'ACN':
                return 'Enter 9-digit ACN number';
            case 'NAME':
                return 'Search by Business name, ABN or ACN';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }
    
    get searchButtonLabel() {
        return this.searchType === 'ABN' ? 'Verify' : 'Search';
    }
    
    get isSearchDisabled() {
        return this.isLoading || !this.isValidInput || this.isReadOnly;
    }
    
    get isValidInput() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            return false;
        }
        
        const trimmedTerm = this.searchTerm.trim();
        
        switch(this.searchType) {
            case 'ABN':
                return /^\d{11}$/.test(trimmedTerm.replace(/\s/g, ''));
            case 'ACN':
                return /^\d{9}$/.test(trimmedTerm.replace(/\s/g, ''));
            case 'NAME':
                return trimmedTerm.length >= 2;
            default:
                return trimmedTerm.length >= 2;
        }
    }
    
    get showResults() {
        return !this.isLoading && !this.showError && this.searchResults.length > 0 && !this.showSelectedResult;
    }
    
    get showNoResults() {
        return !this.isLoading && !this.showError && this.searchResults.length === 0 && this.hasSearched && !this.showSelectedResult;
    }
    
    get showError() {
        return !this.isLoading && this.errorMessage && this.errorMessage.length > 0;
    }
    
    get showSelectedResult() {
        return this.selectedResult !== null;
    }
    
    get showPagination() {
        return this.allResults.length > this.pageSize;
    }
    
    @track hasSearched = false;
    
    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearError();
    }
    
    detectSearchType() {
        const trimmedTerm = this.searchTerm.trim().replace(/\s/g, '');
        
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = 'ABN';
        } else if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = 'ACN';
        } else {
            this.searchType = 'NAME';
        }
    }
    
    async handleSearch() {
        if (!this.isValidInput) {
            this.showValidationError();
            return;
        }
        
        this.isLoading = true;
        this.clearError();
        this.hasSearched = true;
        
        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };
            
            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSearchSuccessEvent(result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchErrorEvent(error.message);
        } finally {
            this.isLoading = false;
        }
    }
    
    processSearchResults(data) {
        if (data && Array.isArray(data) && data.length > 0) {
            this.allResults = data.map((item, index) => ({
                id: `result-${index}`,
                abnNumber: item.abnNumber || 'N/A',
                entityName: item.entityName || 'N/A',
                abnStatus: item.abnStatus || 'N/A',
                entityType: item.entityType || 'N/A',
                gstStatus: item.gstStatus || 'N/A',
                businessLocation: item.businessLocation || 'N/A',
                rawData: item
            }));
            
            this.updatePaginatedResults();
        } else {
            this.allResults = [];
            this.searchResults = [];
        }
    }
    
    updatePaginatedResults() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.searchResults = this.allResults.slice(startIndex, endIndex);
    }
    
    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.allResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = { ...selected };
            this.dispatchSelectionEvent(this.selectedResult);
        }
    }
    
    handleChangeAbn() {
        this.selectedResult = null;
        this.searchTerm = '';
        this.searchType = '';
        this.searchResults = [];
        this.allResults = [];
        this.hasSearched = false;
        this.clearError();
        
        this.dispatchChangeEvent();
    }
    
    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
        this.currentPage = event.detail.currentPage;
    }
    
    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize;
        this.currentPage = 1;
        this.updatePaginatedResults();
    }
    
    // Utility methods
    showValidationError() {
        switch(this.searchType) {
            case 'ABN':
                this.errorMessage = 'Please enter a valid 11-digit ABN number.';
                break;
            case 'ACN':
                this.errorMessage = 'Please enter a valid 9-digit ACN number.';
                break;
            case 'NAME':
                this.errorMessage = 'Please enter at least 2 characters for company name search.';
                break;
            default:
                this.errorMessage = 'Please enter valid search criteria.';
        }
    }
    
    clearError() {
        this.errorMessage = '';
    }
    
    // Public API methods for parent components
    @api
    refreshData() {
        if (this.hasSearched && this.searchTerm) {
            this.handleSearch();
        }
    }
    
    @api
    validateComponent() {
        return this.isValidInput;
    }
    
    @api
    clearSearch() {
        this.handleChangeAbn();
    }
    
    @api
    getSelectedResult() {
        return this.selectedResult;
    }
    
    // Custom events for parent communication
    dispatchSearchSuccessEvent(data) {
        const successEvent = new CustomEvent('searchsuccess', {
            detail: {
                componentName: 'MyFormabn',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                results: data,
                resultCount: data.length,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }
    
    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('abnselected', {
            detail: {
                componentName: 'MyFormabn',
                selectedResult: selectedResult,
                abnNumber: selectedResult.abnNumber,
                entityName: selectedResult.entityName,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }
    
    dispatchChangeEvent() {
        const changeEvent = new CustomEvent('abnchange', {
            detail: {
                componentName: 'MyFormabn',
                action: 'cleared',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }
    
    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'MyFormabn',
                errorMessage: errorMessage,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }
}
