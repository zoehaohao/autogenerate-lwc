import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/FormMyTestingController.searchABN';

export default class FormMyTesting extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track allResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';
    
    // Computed properties
    get searchPlaceholder() {
        switch(this.searchType) {
            case 'abn':
                return 'Enter 11-digit ABN number';
            case 'acn':
                return 'Enter 9-digit ACN number';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }
    
    get searchButtonLabel() {
        return this.searchType === 'abn' ? 'Verify' : 'Search';
    }
    
    get isSearchDisabled() {
        return this.isLoading || !this.isValidInput;
    }
    
    get isValidInput() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            return false;
        }
        
        const trimmedTerm = this.searchTerm.trim();
        
        switch(this.searchType) {
            case 'abn':
                return /^\d{11}$/.test(trimmedTerm.replace(/\s/g, ''));
            case 'acn':
                return /^\d{9}$/.test(trimmedTerm.replace(/\s/g, ''));
            case 'name':
                return trimmedTerm.length >= 2;
            default:
                return false;
        }
    }
    
    get showError() {
        return !this.isLoading && this.errorMessage && this.errorMessage.length > 0;
    }
    
    get showNoResults() {
        return !this.isLoading && !this.showError && this.searchResults.length === 0 && this.hasSearched;
    }
    
    get showResults() {
        return !this.isLoading && !this.showError && this.searchResults.length > 0;
    }
    
    get showPagination() {
        return this.allResults.length > 10;
    }
    
    hasSearched = false;
    
    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearResults();
    }
    
    handleKeyUp(event) {
        if (event.keyCode === 13 && this.isValidInput) {
            this.handleSearch();
        }
    }
    
    async handleSearch() {
        if (!this.isValidInput) {
            return;
        }
        
        this.isLoading = true;
        this.clearResults();
        this.hasSearched = true;
        
        try {
            const result = await searchABN({
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            });
            
            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSearchSuccessEvent(result.data);
            } else {
                this.errorMessage = result.message || 'An error occurred while searching';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.dispatchErrorEvent(this.errorMessage);
        } finally {
            this.isLoading = false;
        }
    }
    
    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.allResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            this.dispatchSelectionEvent(selectedResult);
        }
    }
    
    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
    }
    
    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }
    
    // Helper methods
    detectSearchType() {
        const trimmedTerm = this.searchTerm.trim().replace(/\s/g, '');
        
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }
    
    processSearchResults(data) {
        if (!data) {
            this.allResults = [];
            this.searchResults = [];
            return;
        }
        
        // Handle both single result and array of results
        const resultsArray = Array.isArray(data) ? data : [data];
        
        this.allResults = resultsArray.map((item, index) => ({
            id: `result-${index}`,
            abnNumber: this.extractABNNumber(item),
            entityName: this.extractEntityName(item),
            abnStatus: this.extractABNStatus(item),
            entityType: this.extractEntityType(item),
            gstStatus: this.extractGSTStatus(item),
            businessLocation: this.extractBusinessLocation(item),
            rawData: item
        }));
        
        // Set initial paginated results
        this.searchResults = this.allResults.slice(0, 10);
    }
    
    extractABNNumber(item) {
        return item.abn?.identifier_value || 'N/A';
    }
    
    extractEntityName(item) {
        return item.other_trading_name?.organisation_name || 'N/A';
    }
    
    extractABNStatus(item) {
        const status = item.entity_status?.entity_status_code || 'Unknown';
        const effectiveFrom = item.entity_status?.effective_from;
        return effectiveFrom ? `${status} from ${this.formatDate(effectiveFrom)}` : status;
    }
    
    extractEntityType(item) {
        return item.entity_type?.entity_description || 'N/A';
    }
    
    extractGSTStatus(item) {
        const gstFrom = item.goods_and_services_tax?.effective_from;
        return gstFrom ? `Registered from ${this.formatDate(gstFrom)}` : 'Not registered';
    }
    
    extractBusinessLocation(item) {
        return item.asic_number || 'N/A';
    }
    
    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return '';
        }
        
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
    
    clearResults() {
        this.searchResults = [];
        this.allResults = [];
        this.errorMessage = '';
        this.hasSearched = false;
    }
    
    // Custom events for parent communication
    dispatchSearchSuccessEvent(data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'FormMyTesting',
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
                componentName: 'FormMyTesting',
                errorMessage: errorMessage,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }
    
    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('resultselected', {
            detail: {
                componentName: 'FormMyTesting',
                selectedResult: selectedResult,
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
        this.clearResults();
    }
    
    @api
    validateComponent() {
        return this.isValidInput;
    }
    
    @api
    clearSearch() {
        this.searchTerm = '';
        this.clearResults();
        this.searchType = 'name';
    }
}
