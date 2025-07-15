import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupWorkingExampleController.searchABN';

export default class AbnLookupWorkingExample extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track detectedSearchType = '';
    @track hasSearched = false;

    // Search type constants
    SEARCH_TYPES = {
        ABN: 'ABN',
        ACN: 'ACN',
        NAME: 'NAME'
    };

    connectedCallback() {
        if (this.initialData) {
            this.searchTerm = this.initialData;
            this.detectSearchType();
        }
    }

    get searchPlaceholder() {
        switch (this.detectedSearchType) {
            case this.SEARCH_TYPES.ABN:
                return 'Enter 11-digit ABN number';
            case this.SEARCH_TYPES.ACN:
                return 'Enter 9-digit ACN number';
            case this.SEARCH_TYPES.NAME:
                return 'Enter company name (minimum 2 characters)';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchTypeLabel() {
        switch (this.detectedSearchType) {
            case this.SEARCH_TYPES.ABN:
                return 'ABN Search';
            case this.SEARCH_TYPES.ACN:
                return 'ACN Search';
            case this.SEARCH_TYPES.NAME:
                return 'Company Name Search';
            default:
                return '';
        }
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

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
    }

    detectSearchType() {
        if (!this.searchTerm) {
            this.detectedSearchType = '';
            return;
        }

        const cleanTerm = this.searchTerm.replace(/\s/g, '');
        
        // Check for ABN (11 digits)
        if (/^\d{11}$/.test(cleanTerm)) {
            this.detectedSearchType = this.SEARCH_TYPES.ABN;
        }
        // Check for ACN (9 digits)
        else if (/^\d{9}$/.test(cleanTerm)) {
            this.detectedSearchType = this.SEARCH_TYPES.ACN;
        }
        // Default to name search
        else {
            this.detectedSearchType = this.SEARCH_TYPES.NAME;
        }
    }

    validateSearch() {
        const cleanTerm = this.searchTerm.trim();
        
        if (!cleanTerm) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }

        switch (this.detectedSearchType) {
            case this.SEARCH_TYPES.ABN:
                if (!/^\d{11}$/.test(cleanTerm.replace(/\s/g, ''))) {
                    this.errorMessage = 'ABN must be exactly 11 digits';
                    return false;
                }
                break;
            case this.SEARCH_TYPES.ACN:
                if (!/^\d{9}$/.test(cleanTerm.replace(/\s/g, ''))) {
                    this.errorMessage = 'ACN must be exactly 9 digits';
                    return false;
                }
                break;
            case this.SEARCH_TYPES.NAME:
                if (cleanTerm.length < 2) {
                    this.errorMessage = 'Company name must be at least 2 characters';
                    return false;
                }
                break;
        }

        return true;
    }

    async handleSearch() {
        if (!this.validateSearch()) {
            return;
        }

        this.isLoading = true;
        this.clearMessages();

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.detectedSearchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.searchResults = this.processSearchResults(result.data);
                this.hasSearched = true;
                this.dispatchSearchSuccess(result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.dispatchSearchError(result.message);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchSearchError(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data) return [];

        // Handle single result or array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map((item, index) => {
            return {
                id: `result-${index}`,
                abnNumber: this.getNestedValue(item, 'abn.identifier_value') || 'N/A',
                entityName: this.getNestedValue(item, 'other_trading_name.organisation_name') || 'N/A',
                abnStatus: this.getNestedValue(item, 'entity_status.entity_status_code') || 'N/A',
                entityType: this.getNestedValue(item, 'entity_type.entity_description') || 'N/A',
                gstStatus: this.getNestedValue(item, 'goods_and_services_tax.effective_from') ? 'Registered' : 'Not Registered',
                asicNumber: item.asic_number || 'N/A',
                lastUpdated: item.record_last_updated_date || 'N/A',
                dgrEndorsement: this.getNestedValue(item, 'dgr_endorsement.entity_endorsement') || 'N/A',
                rawData: item
            };
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            this.dispatchResultSelected(selectedResult);
        }
    }

    clearMessages() {
        this.errorMessage = '';
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm) {
            this.handleSearch();
        }
    }

    @api
    validateComponent() {
        return this.validateSearch();
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.detectedSearchType = '';
        this.hasSearched = false;
        this.clearMessages();
    }

    // Custom events for parent communication
    dispatchSearchSuccess(data) {
        const successEvent = new CustomEvent('searchsuccess', {
            detail: {
                componentName: 'abnLookupWorkingExample',
                searchTerm: this.searchTerm,
                searchType: this.detectedSearchType,
                results: data,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchSearchError(errorMessage) {
        const errorEvent = new CustomEvent('searcherror', {
            detail: {
                componentName: 'abnLookupWorkingExample',
                errorMessage: errorMessage,
                searchTerm: this.searchTerm,
                searchType: this.detectedSearchType,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchResultSelected(result) {
        const selectEvent = new CustomEvent('resultselected', {
            detail: {
                componentName: 'abnLookupWorkingExample',
                selectedResult: result,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectEvent);
    }
}
