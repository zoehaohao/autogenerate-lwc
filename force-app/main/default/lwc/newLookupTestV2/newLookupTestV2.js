import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newLookupTestV2Controller.searchABN';

export default class NewLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = '';
    
    // Validation patterns
    abnPattern = /^\d{11}$/;
    acnPattern = /^\d{9}$/;
    
    get searchPlaceholder() {
        switch(this.searchType) {
            case 'ABN':
                return 'Enter 11-digit ABN number';
            case 'ACN':
                return 'Enter 9-digit ACN number';
            case 'NAME':
                return 'Enter company name (minimum 2 characters)';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }
    
    get searchButtonLabel() {
        return this.searchType === 'ABN' ? 'Verify' : 'Search';
    }
    
    get isSearchDisabled() {
        return this.isLoading || !this.isValidInput;
    }
    
    get isValidInput() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            return false;
        }
        
        const trimmedTerm = this.searchTerm.trim();
        
        // ABN validation
        if (this.abnPattern.test(trimmedTerm)) {
            return true;
        }
        
        // ACN validation
        if (this.acnPattern.test(trimmedTerm)) {
            return true;
        }
        
        // Company name validation (minimum 2 characters)
        if (trimmedTerm.length >= 2) {
            return true;
        }
        
        return false;
    }
    
    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading;
    }
    
    get showNoResults() {
        return !this.isLoading && this.searchResults && this.searchResults.length === 0 && this.searchTerm;
    }
    
    get showError() {
        return !this.isLoading && this.errorMessage;
    }
    
    get showPagination() {
        return this.searchResults && this.searchResults.length > 10;
    }
    
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearResults();
    }
    
    detectSearchType() {
        if (!this.searchTerm) {
            this.searchType = '';
            return;
        }
        
        const trimmedTerm = this.searchTerm.trim();
        
        if (this.abnPattern.test(trimmedTerm)) {
            this.searchType = 'ABN';
        } else if (this.acnPattern.test(trimmedTerm)) {
            this.searchType = 'ACN';
        } else {
            this.searchType = 'NAME';
        }
    }
    
    clearResults() {
        this.searchResults = [];
        this.paginatedResults = [];
        this.errorMessage = '';
    }
    
    async handleSearch() {
        if (!this.isValidInput) {
            return;
        }
        
        this.isLoading = true;
        this.clearResults();
        
        try {
            const searchData = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };
            
            const result = await searchABN({ searchData: JSON.stringify(searchData) });
            
            if (result.success) {
                this.searchResults = this.processSearchResults(result.data);
                this.paginatedResults = this.searchResults.slice(0, 10); // Show first 10 results
                
                // Dispatch success event to parent
                this.dispatchSuccessEvent(this.searchResults);
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.dispatchErrorEvent(error.message);
        } finally {
            this.isLoading = false;
        }
    }
    
    processSearchResults(data) {
        if (!data) return [];
        
        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map(result => {
            return {
                ...result,
                entity_name: this.getEntityName(result),
                abnStatus: this.getABNStatus(result),
                gstStatus: this.getGSTStatus(result),
                main_business_location: this.getMainBusinessLocation(result)
            };
        });
    }
    
    getEntityName(result) {
        if (result.other_trading_name && result.other_trading_name.organisation_name) {
            return result.other_trading_name.organisation_name;
        }
        return 'N/A';
    }
    
    getABNStatus(result) {
        if (result.entity_status) {
            const status = result.entity_status.entity_status_code || 'Unknown';
            const effectiveFrom = result.entity_status.effective_from || '';
            return effectiveFrom ? `${status} from ${this.formatDate(effectiveFrom)}` : status;
        }
        return 'N/A';
    }
    
    getGSTStatus(result) {
        if (result.goods_and_services_tax) {
            const effectiveFrom = result.goods_and_services_tax.effective_from;
            return effectiveFrom ? `Registered from ${this.formatDate(effectiveFrom)}` : 'Registered';
        }
        return 'Not registered';
    }
    
    getMainBusinessLocation(result) {
        // This would typically come from the API response
        // For now, using a placeholder as it's not in the sample response
        return result.main_business_location || 'N/A';
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
    
    handleSelectResult(event) {
        const selectedABN = event.target.dataset.abn;
        const selectedResult = this.searchResults.find(result => 
            result.abn.identifier_value === selectedABN
        );
        
        if (selectedResult) {
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('abnselected', {
                detail: {
                    componentName: 'newLookupTestV2',
                    selectedResult: selectedResult,
                    abn: selectedABN,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);
        }
    }
    
    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
    }
    
    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }
    
    dispatchSuccessEvent(results) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'newLookupTestV2',
                result: results,
                message: 'Search completed successfully',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
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
                componentName: 'newLookupTestV2',
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
        this.searchType = '';
        this.clearResults();
    }
}
