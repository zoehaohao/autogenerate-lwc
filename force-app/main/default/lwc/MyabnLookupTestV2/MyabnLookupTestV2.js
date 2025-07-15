import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/MyabnLookupTestV2Controller.searchABN';

export default class MyabnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = '';
    @track hasSearched = false;

    // Computed properties
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
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading && !this.errorMessage;
    }

    get showNoResults() {
        return this.hasSearched && !this.hasResults && !this.isLoading && !this.errorMessage;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13 && this.isValidSearchTerm) { // Enter key
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (!this.isValidSearchTerm) {
            this.errorMessage = 'Please enter a valid search term';
            return;
        }

        this.isLoading = true;
        this.clearMessages();
        this.hasSearched = true;

        try {
            const result = await searchABN({
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            });

            if (result.success) {
                this.searchResults = this.processSearchResults(result.data);
                this.dispatchSuccessEvent(result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchErrorEvent(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('resultselected', {
                detail: {
                    componentName: 'MyabnLookupTestV2',
                    selectedResult: selectedResult,
                    timestamp: new Date().toISOString()
                }
            });
            this.dispatchEvent(selectionEvent);
        }
    }

    // Helper methods
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

    processSearchResults(data) {
        if (!data) return [];
        
        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map((item, index) => {
            return {
                id: `result-${index}`,
                abnNumber: item.abnNumber || 'N/A',
                entityName: item.entityName || 'N/A',
                abnStatus: item.abnStatus || 'N/A',
                entityType: item.entityType || 'N/A',
                gstStatus: item.gstStatus || null,
                mainBusinessLocation: item.mainBusinessLocation || null,
                rawData: item
            };
        });
    }

    clearMessages() {
        this.errorMessage = '';
    }

    // Parent communication methods
    dispatchSuccessEvent(result) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'MyabnLookupTestV2',
                result: result,
                message: 'Search completed successfully',
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'MyabnLookupTestV2',
                errorMessage: typeof error === 'string' ? error : error.message,
                errorCode: error.code || 'UNKNOWN_ERROR',
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm && this.isValidSearchTerm) {
            this.handleSearch();
        }
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.clearMessages();
        this.hasSearched = false;
        this.searchType = '';
    }

    @api
    validateComponent() {
        return {
            isValid: this.isValidSearchTerm,
            searchTerm: this.searchTerm,
            searchType: this.searchType,
            hasResults: this.hasResults
        };
    }
}
