import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newLookupTestV2Controller.searchABN';

export default class NewLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = '';
    @track showNoResults = false;
    
    // Getters for dynamic properties
    get searchPlaceholder() {
        switch(this.searchType) {
            case 'ABN':
                return 'Enter 11-digit ABN number';
            case 'ACN':
                return 'Enter 9-digit ACN number';
            case 'NAME':
                return 'Enter company/business name';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }
    
    get searchButtonLabel() {
        return this.searchType === 'ABN' ? 'Verify' : 'Search';
    }
    
    get isSearchDisabled() {
        return this.isLoading || !this.isValidSearchTerm;
    }
    
    get isValidSearchTerm() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            return false;
        }
        
        const trimmedTerm = this.searchTerm.trim();
        
        // ABN validation (11 digits)
        if (/^\d{11}$/.test(trimmedTerm)) {
            return true;
        }
        
        // ACN validation (9 digits)
        if (/^\d{9}$/.test(trimmedTerm)) {
            return true;
        }
        
        // Company name validation (minimum 2 characters)
        if (trimmedTerm.length >= 2 && /^[a-zA-Z0-9\s&.-]+$/.test(trimmedTerm)) {
            return true;
        }
        
        return false;
    }
    
    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }
    
    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
    }
    
    detectSearchType() {
        const trimmedTerm = this.searchTerm.trim();
        
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = 'ABN';
        } else if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = 'ACN';
        } else if (trimmedTerm.length >= 2) {
            this.searchType = 'NAME';
        } else {
            this.searchType = '';
        }
    }
    
    handleSearch() {
        if (!this.isValidSearchTerm) {
            this.showError('Please enter valid search criteria');
            return;
        }
        
        this.performSearch();
    }
    
    async performSearch() {
        this.isLoading = true;
        this.clearMessages();
        this.searchResults = [];
        
        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };
            
            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
            } else {
                this.showError(result.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('An unexpected error occurred. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }
    
    processSearchResults(data) {
        if (data && Array.isArray(data) && data.length > 0) {
            this.searchResults = data.map((item, index) => ({
                id: `result_${index}`,
                abnNumber: item.abnNumber || 'N/A',
                entityName: item.entityName || 'N/A',
                abnStatus: item.abnStatus || '',
                entityType: item.entityType || '',
                gstStatus: item.gstStatus || '',
                mainBusinessLocation: item.mainBusinessLocation || '',
                rawData: item
            }));
            
            // Dispatch success event to parent
            this.dispatchSuccessEvent({
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                resultCount: this.searchResults.length,
                results: this.searchResults
            });
        } else {
            this.showNoResults = true;
        }
    }
    
    handleSelectResult(event) {
        const resultId = event.currentTarget.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('resultselected', {
                detail: {
                    componentName: 'newLookupTestV2',
                    selectedResult: selectedResult,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);
        }
    }
    
    // Utility methods
    clearMessages() {
        this.errorMessage = '';
        this.showNoResults = false;
    }
    
    showError(message) {
        this.errorMessage = message;
        this.showNoResults = false;
        
        // Dispatch error event to parent
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'newLookupTestV2',
                errorMessage: message,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }
    
    dispatchSuccessEvent(data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'newLookupTestV2',
                result: data,
                message: 'Search completed successfully',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }
    
    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm && this.isValidSearchTerm) {
            this.performSearch();
        }
    }
    
    @api
    validateComponent() {
        return {
            isValid: this.isValidSearchTerm,
            searchTerm: this.searchTerm,
            searchType: this.searchType
        };
    }
    
    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.searchType = '';
        this.clearMessages();
    }
}
