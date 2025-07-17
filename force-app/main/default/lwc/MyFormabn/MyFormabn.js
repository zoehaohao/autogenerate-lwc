import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/MyFormabnController.searchABN';

export default class MyFormabn extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;
    
    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track allResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';
    @track selectedResult = null;
    
    // Component state
    hasSearched = false;
    
    // Getters for dynamic content
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
        return this.searchType === 'name' ? 'Search' : 'Verify';
    }
    
    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }
    
    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading;
    }
    
    get showNoResults() {
        return this.hasSearched && !this.hasResults && !this.isLoading && !this.errorMessage;
    }
    
    get showPagination() {
        return this.allResults && this.allResults.length > 10;
    }
    
    // Lifecycle hooks
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
            this.detectSearchType();
        }
    }
    
    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearResults();
        
        // Notify parent of search term change
        this.dispatchSearchChangeEvent();
    }
    
    handleSearch() {
        if (!this.validateInput()) {
            return;
        }
        
        this.performSearch();
    }
    
    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            this.selectedResult = selectedResult;
            this.dispatchSelectionEvent(selectedResult);
        }
    }
    
    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
    }
    
    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }
    
    // Search functionality
    detectSearchType() {
        const term = this.searchTerm.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(term)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(term)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }
    
    validateInput() {
        this.errorMessage = '';
        
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }
        
        const cleanTerm = this.searchTerm.replace(/\s/g, '');
        
        switch(this.searchType) {
            case 'abn':
                if (!/^\d{11}$/.test(cleanTerm)) {
                    this.errorMessage = 'ABN must be exactly 11 digits';
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(cleanTerm)) {
                    this.errorMessage = 'ACN must be exactly 9 digits';
                    return false;
                }
                break;
            case 'name':
                if (this.searchTerm.trim().length < 2) {
                    this.errorMessage = 'Company name must be at least 2 characters';
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    async performSearch() {
        this.isLoading = true;
        this.errorMessage = '';
        this.clearResults();
        
        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };
            
            const response = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (response.success) {
                this.processSearchResults(response.data);
                this.hasSearched = true;
                this.dispatchSearchCompleteEvent(response.data);
            } else {
                this.errorMessage = response.message || 'Search failed. Please try again.';
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
        if (!data) {
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
    
    // Data extraction helpers
    extractABNNumber(data) {
        return data.abn?.identifier_value || data.abnNumber || 'N/A';
    }
    
    extractEntityName(data) {
        return data.other_trading_name?.organisation_name || 
               data.entityName || 
               data.organisation_name || 
               'N/A';
    }
    
    extractABNStatus(data) {
        const status = data.entity_status?.entity_status_code || data.abnStatus || 'Unknown';
        const effectiveFrom = data.entity_status?.effective_from || data.effectiveFrom;
        
        if (effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status;
    }
    
    extractEntityType(data) {
        return data.entity_type?.entity_description || 
               data.entityType || 
               'Unknown';
    }
    
    extractGSTStatus(data) {
        const gstData = data.goods_and_services_tax;
        if (gstData && gstData.effective_from && gstData.effective_from !== '0001-01-01') {
            return `Registered from ${this.formatDate(gstData.effective_from)}`;
        }
        return data.gstStatus || 'Not registered';
    }
    
    extractBusinessLocation(data) {
        return data.businessLocation || 
               data.main_business_location || 
               data.asic_number || 
               'N/A';
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
    
    // Utility methods
    clearResults() {
        this.searchResults = [];
        this.allResults = [];
        this.errorMessage = '';
        this.hasSearched = false;
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
    clearSearch() {
        this.searchTerm = '';
        this.clearResults();
        this.searchType = 'name';
    }
    
    @api
    getSelectedResult() {
        return this.selectedResult;
    }
    
    // Event dispatching for parent communication
    dispatchSearchChangeEvent() {
        const changeEvent = new CustomEvent('searchchange', {
            detail: {
                componentName: 'MyFormabn',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }
    
    dispatchSearchCompleteEvent(results) {
        const completeEvent = new CustomEvent('searchcomplete', {
            detail: {
                componentName: 'MyFormabn',
                results: results,
                resultCount: this.allResults.length,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(completeEvent);
    }
    
    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('resultselected', {
            detail: {
                componentName: 'MyFormabn',
                selectedResult: selectedResult,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }
    
    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'MyFormabn',
                errorMessage: errorMessage,
                searchTerm: this.searchTerm,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }
}
