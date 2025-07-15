import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
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
        switch (this.searchType) {
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

    get searchButtonDisabled() {
        return this.isLoading || !this.isValidSearch;
    }

    get isValidSearch() {
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

    get showNoResults() {
        return this.hasSearched && !this.isLoading && !this.hasResults && !this.errorMessage;
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
        if (!this.isValidSearch) {
            this.showErrorMessage('Please enter valid search criteria');
            return;
        }

        this.performSearch();
    }

    handleClear() {
        this.searchTerm = '';
        this.searchResults = [];
        this.searchType = '';
        this.hasSearched = false;
        this.clearMessages();
        
        // Notify parent of clear action
        this.dispatchEvent(new CustomEvent('clear', {
            detail: {
                componentName: 'MyabnLookupTestV2',
                timestamp: new Date().toISOString()
            }
        }));
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            // Notify parent of selection
            const selectionEvent = new CustomEvent('resultselected', {
                detail: {
                    componentName: 'MyabnLookupTestV2',
                    selectedResult: selectedResult,
                    timestamp: new Date().toISOString()
                }
            });
            this.dispatchEvent(selectionEvent);

            // Show success toast
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: `Selected: ${selectedResult.entityName}`,
                variant: 'success'
            }));
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

    async performSearch() {
        this.isLoading = true;
        this.clearMessages();
        this.hasSearched = true;

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });

            if (result.success) {
                this.processSearchResults(result.data);
                
                // Notify parent of successful search
                this.dispatchEvent(new CustomEvent('searchcomplete', {
                    detail: {
                        componentName: 'MyabnLookupTestV2',
                        searchTerm: this.searchTerm,
                        searchType: this.searchType,
                        resultCount: this.searchResults.length,
                        timestamp: new Date().toISOString()
                    }
                }));
            } else {
                this.showErrorMessage(result.message || 'Search failed. Please try again.');
                this.searchResults = [];
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showErrorMessage('An unexpected error occurred. Please try again.');
            this.searchResults = [];
            
            // Notify parent of error
            this.dispatchEvent(new CustomEvent('error', {
                detail: {
                    componentName: 'MyabnLookupTestV2',
                    errorMessage: error.message,
                    searchTerm: this.searchTerm,
                    timestamp: new Date().toISOString()
                }
            }));
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data) {
            this.searchResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((item, index) => {
            return {
                id: `result-${index}`,
                abnNumber: this.getFieldValue(item, 'abn.identifier_value') || 'N/A',
                entityName: this.getFieldValue(item, 'other_trading_name.organisation_name') || 'N/A',
                abnStatus: this.getFieldValue(item, 'entity_status.entity_status_code') || 'N/A',
                entityType: this.getFieldValue(item, 'entity_type.entity_description') || 'N/A',
                gstStatus: this.getGSTStatus(item),
                businessLocation: this.getFieldValue(item, 'main_business_location') || 'N/A',
                asicNumber: this.getFieldValue(item, 'asic_number') || 'N/A',
                lastUpdated: this.formatDate(this.getFieldValue(item, 'record_last_updated_date'))
            };
        });
    }

    getFieldValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    getGSTStatus(item) {
        const gstData = this.getFieldValue(item, 'goods_and_services_tax');
        if (gstData && gstData.effective_from && gstData.effective_from !== '0001-01-01') {
            return `Registered from ${this.formatDate(gstData.effective_from)}`;
        }
        return 'Not Registered';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return 'N/A';
        }
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-AU');
        } catch (error) {
            return dateString;
        }
    }

    showErrorMessage(message) {
        this.errorMessage = message;
        setTimeout(() => {
            this.errorMessage = '';
        }, 5000);
    }

    clearMessages() {
        this.errorMessage = '';
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm && this.isValidSearch) {
            this.performSearch();
        }
    }

    @api
    validateComponent() {
        return {
            isValid: this.isValidSearch,
            searchTerm: this.searchTerm,
            searchType: this.searchType,
            hasResults: this.hasResults
        };
    }

    @api
    clearSearch() {
        this.handleClear();
    }

    @api
    setSearchTerm(term) {
        this.searchTerm = term;
        this.detectSearchType();
    }
}
