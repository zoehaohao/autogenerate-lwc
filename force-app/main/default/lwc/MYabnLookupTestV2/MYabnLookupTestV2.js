import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/MYabnLookupTestV2Controller.searchABN';

export default class MYabnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track validationError = '';
    @track searchType = '';
    
    searchTimeout;

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
        return this.isLoading || !this.searchTerm || this.validationError;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && !this.hasResults && this.searchTerm;
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.validateInput();
        this.clearResults();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    detectSearchType() {
        const term = this.searchTerm.trim();
        
        if (/^\d{11}$/.test(term)) {
            this.searchType = 'ABN';
        } else if (/^\d{9}$/.test(term)) {
            this.searchType = 'ACN';
        } else if (term.length >= 2) {
            this.searchType = 'NAME';
        } else {
            this.searchType = '';
        }
    }

    validateInput() {
        const term = this.searchTerm.trim();
        this.validationError = '';

        if (!term) {
            return;
        }

        switch(this.searchType) {
            case 'ABN':
                if (!/^\d{11}$/.test(term)) {
                    this.validationError = 'ABN must be exactly 11 digits';
                }
                break;
            case 'ACN':
                if (!/^\d{9}$/.test(term)) {
                    this.validationError = 'ACN must be exactly 9 digits';
                }
                break;
            case 'NAME':
                if (term.length < 2) {
                    this.validationError = 'Company name must be at least 2 characters';
                }
                break;
            default:
                if (term.length > 0) {
                    this.validationError = 'Please enter a valid ABN (11 digits), ACN (9 digits), or company name (2+ characters)';
                }
        }
    }

    async handleSearch() {
        if (!this.searchTerm || this.validationError || this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.clearResults();

        try {
            const result = await searchABN({
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            });

            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSearchEvent('success', result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.dispatchSearchEvent('error', { message: this.errorMessage });
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchSearchEvent('error', { message: this.errorMessage });
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
        
        this.searchResults = results.map((item, index) => ({
            id: `result-${index}`,
            abnNumber: this.getNestedValue(item, 'abn.identifier_value') || 'N/A',
            entityName: this.getNestedValue(item, 'other_trading_name.organisation_name') || 
                       this.getNestedValue(item, 'entity_name') || 'Unknown Entity',
            abnStatus: this.getNestedValue(item, 'entity_status.entity_status_code') || 'Unknown',
            entityType: this.getNestedValue(item, 'entity_type.entity_description') || 'Unknown',
            acnNumber: this.getNestedValue(item, 'asic_number'),
            effectiveFrom: this.formatDate(this.getNestedValue(item, 'entity_status.effective_from')),
            gstStatus: this.getNestedValue(item, 'goods_and_services_tax.effective_from') ? 'Registered' : null,
            dgrEndorsement: this.getNestedValue(item, 'dgr_endorsement.entity_endorsement'),
            rawData: item
        }));
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return null;
        }
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            this.dispatchSelectionEvent(selectedResult);
        }
    }

    clearResults() {
        this.searchResults = [];
        this.errorMessage = '';
    }

    dispatchSearchEvent(type, data) {
        const searchEvent = new CustomEvent('abnlookup', {
            detail: {
                type: type,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                data: data,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(searchEvent);
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('abnselection', {
            detail: {
                selectedResult: selectedResult,
                abnNumber: selectedResult.abnNumber,
                entityName: selectedResult.entityName,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectionEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm) {
            this.handleSearch();
        }
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchType = '';
        this.validationError = '';
        this.clearResults();
    }

    @api
    validateComponent() {
        this.validateInput();
        return !this.validationError;
    }

    @api
    getSearchResults() {
        return this.searchResults;
    }
}
