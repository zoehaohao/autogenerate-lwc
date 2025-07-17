import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/ABNLookupCompController.searchABN';

export default class ABNLookupComp extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track allResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = '';
    @track currentSearchTerm = '';
    
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
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }
    
    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.selectedResult;
    }
    
    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.currentSearchTerm && 
               (!this.searchResults || this.searchResults.length === 0) && !this.selectedResult;
    }
    
    get showPagination() {
        return this.allResults && this.allResults.length > 10;
    }
    
    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
    }
    
    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }
    
    handleSearch() {
        if (this.isSearchDisabled) {
            return;
        }
        
        if (!this.validateInput()) {
            return;
        }
        
        this.performSearch();
    }
    
    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.allResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = selected;
            this.searchResults = [];
            
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('abnselected', {
                detail: {
                    selectedABN: selected,
                    componentName: 'ABNLookupComp',
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);
        }
    }
    
    handleChangeABN() {
        this.selectedResult = null;
        this.searchResults = [];
        this.allResults = [];
        this.searchTerm = '';
        this.currentSearchTerm = '';
        this.clearMessages();
        
        // Dispatch change event to parent
        const changeEvent = new CustomEvent('abnchanged', {
            detail: {
                componentName: 'ABNLookupComp',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }
    
    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
    }
    
    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }
    
    // Private methods
    detectSearchType() {
        const term = this.searchTerm.trim();
        
        if (/^\d{11}$/.test(term)) {
            this.searchType = 'ABN';
        } else if (/^\d{9}$/.test(term)) {
            this.searchType = 'ACN';
        } else {
            this.searchType = 'NAME';
        }
    }
    
    validateInput() {
        const term = this.searchTerm.trim();
        
        switch(this.searchType) {
            case 'ABN':
                if (!/^\d{11}$/.test(term)) {
                    this.errorMessage = 'ABN must be exactly 11 digits';
                    return false;
                }
                break;
            case 'ACN':
                if (!/^\d{9}$/.test(term)) {
                    this.errorMessage = 'ACN must be exactly 9 digits';
                    return false;
                }
                break;
            case 'NAME':
                if (term.length < 2) {
                    this.errorMessage = 'Company name must be at least 2 characters';
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    async performSearch() {
        this.isLoading = true;
        this.clearMessages();
        this.currentSearchTerm = this.searchTerm.trim();
        
        try {
            const result = await searchABN({
                searchTerm: this.currentSearchTerm,
                searchType: this.searchType
            });
            
            if (result.success) {
                this.processSearchResults(result.data);
                
                // Dispatch search event to parent
                const searchEvent = new CustomEvent('searchcompleted', {
                    detail: {
                        searchTerm: this.currentSearchTerm,
                        searchType: this.searchType,
                        resultCount: this.allResults.length,
                        componentName: 'ABNLookupComp',
                        timestamp: new Date().toISOString()
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(searchEvent);
                
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.handleError(result.message);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.handleError(error.message);
        } finally {
            this.isLoading = false;
        }
    }
    
    processSearchResults(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) {
            this.allResults = [];
            this.searchResults = [];
            return;
        }
        
        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.allResults = results.map((item, index) => ({
            id: `result-${index}`,
            abnNumber: this.extractABNNumber(item),
            entityName: this.extractEntityName(item),
            abnStatus: this.extractABNStatus(item),
            entityType: this.extractEntityType(item),
            gstStatus: this.extractGSTStatus(item),
            businessLocation: this.extractBusinessLocation(item),
            rawData: item
        }));
        
        // Show first 10 results initially
        this.searchResults = this.allResults.slice(0, 10);
    }
    
    extractABNNumber(data) {
        return data.abn?.identifier_value || data.abnNumber || 'N/A';
    }
    
    extractEntityName(data) {
        return data.other_trading_name?.organisation_name || 
               data.entityName || 
               data.name || 'N/A';
    }
    
    extractABNStatus(data) {
        const status = data.entity_status?.entity_status_code || data.abnStatus;
        const effectiveFrom = data.entity_status?.effective_from || data.effectiveFrom;
        
        if (status && effectiveFrom) {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status || 'N/A';
    }
    
    extractEntityType(data) {
        return data.entity_type?.entity_description || 
               data.entityType || 'N/A';
    }
    
    extractGSTStatus(data) {
        const gst = data.goods_and_services_tax;
        if (gst?.effective_from) {
            return `Registered from ${this.formatDate(gst.effective_from)}`;
        }
        return data.gstStatus || 'N/A';
    }
    
    extractBusinessLocation(data) {
        return data.businessLocation || 
               data.location || 
               data.asic_number || 'N/A';
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
    
    clearMessages() {
        this.errorMessage = '';
    }
    
    handleError(errorMessage) {
        // Dispatch error event to parent
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'ABNLookupComp',
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
        if (this.currentSearchTerm) {
            this.performSearch();
        }
    }
    
    @api
    clearSelection() {
        this.handleChangeABN();
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
