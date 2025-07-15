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
    @track searchType = 'name';
    @track hasSearched = false;

    // Computed properties
    get searchPlaceholder() {
        switch (this.searchType) {
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
        return this.isLoading || !this.isValidInput;
    }

    get isValidInput() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            return false;
        }

        const trimmedTerm = this.searchTerm.trim();
        
        switch (this.searchType) {
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

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return this.hasSearched && !this.isLoading && !this.hasResults && !this.errorMessage;
    }

    get showClearButton() {
        return this.searchTerm || this.hasResults || this.errorMessage;
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
        if (!this.isValidInput) {
            this.showValidationError();
            return;
        }

        this.performSearch();
    }

    handleClear() {
        this.searchTerm = '';
        this.searchResults = [];
        this.errorMessage = '';
        this.hasSearched = false;
        this.searchType = 'name';
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            // Dispatch custom event to parent
            const selectEvent = new CustomEvent('resultselected', {
                detail: {
                    selectedResult: selectedResult,
                    componentName: 'MyabnLookupTestV2',
                    timestamp: new Date().toISOString()
                }
            });
            this.dispatchEvent(selectEvent);
        }
    }

    // Helper methods
    detectSearchType() {
        if (!this.searchTerm) {
            this.searchType = 'name';
            return;
        }

        const cleanTerm = this.searchTerm.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(cleanTerm)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(cleanTerm)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }

    showValidationError() {
        switch (this.searchType) {
            case 'abn':
                this.errorMessage = 'Please enter a valid 11-digit ABN number';
                break;
            case 'acn':
                this.errorMessage = 'Please enter a valid 9-digit ACN number';
                break;
            case 'name':
                this.errorMessage = 'Please enter at least 2 characters for company name search';
                break;
            default:
                this.errorMessage = 'Please enter valid search criteria';
        }
    }

    clearMessages() {
        this.errorMessage = '';
    }

    async performSearch() {
        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
                this.hasSearched = true;
                
                // Dispatch success event to parent
                const successEvent = new CustomEvent('searchsuccess', {
                    detail: {
                        results: this.searchResults,
                        searchTerm: this.searchTerm,
                        searchType: this.searchType,
                        componentName: 'MyabnLookupTestV2',
                        timestamp: new Date().toISOString()
                    }
                });
                this.dispatchEvent(successEvent);
            } else {
                this.errorMessage = result.message || 'An error occurred while searching';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.dispatchErrorEvent(error.body?.message || error.message);
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
                id: `result_${index}`,
                abnNumber: this.getFieldValue(item, 'abn.identifier_value'),
                entityName: this.getFieldValue(item, 'other_trading_name.organisation_name') || 'N/A',
                abnStatus: this.getFieldValue(item, 'entity_status.entity_status_code'),
                entityType: this.getFieldValue(item, 'entity_type.entity_description'),
                gstStatus: this.formatGSTStatus(item),
                mainBusinessLocation: this.getFieldValue(item, 'main_business_location') || 'N/A',
                asicNumber: this.getFieldValue(item, 'asic_number'),
                lastUpdated: this.formatDate(this.getFieldValue(item, 'record_last_updated_date'))
            };
        });
    }

    getFieldValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    formatGSTStatus(item) {
        const gstFrom = this.getFieldValue(item, 'goods_and_services_tax.effective_from');
        const gstTo = this.getFieldValue(item, 'goods_and_services_tax.effective_to');
        
        if (gstFrom && gstFrom !== '0001-01-01') {
            return `Registered from ${this.formatDate(gstFrom)}`;
        }
        return 'Not registered';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return null;
        }
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-AU');
        } catch (error) {
            return dateString;
        }
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('searcherror', {
            detail: {
                errorMessage: errorMessage,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                componentName: 'MyabnLookupTestV2',
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm && this.isValidInput) {
            this.performSearch();
        }
    }

    @api
    validateComponent() {
        return {
            isValid: this.isValidInput,
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
