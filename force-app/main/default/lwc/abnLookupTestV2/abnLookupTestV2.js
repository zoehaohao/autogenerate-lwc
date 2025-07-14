import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';

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

    get isSearchDisabled() {
        return this.isLoading || !this.isValidSearchTerm;
    }

    get isValidSearchTerm() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            return false;
        }

        const trimmedTerm = this.searchTerm.trim();
        
        switch (this.searchType) {
            case 'abn':
                return /^\d{11}$/.test(trimmedTerm);
            case 'acn':
                return /^\d{9}$/.test(trimmedTerm);
            case 'name':
                return trimmedTerm.length >= 2;
            default:
                return false;
        }
    }

    get hasResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && this.searchResults.length === 0 && this.searchTerm;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearResults();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13 && this.isValidSearchTerm) {
            this.handleSearch();
        }
    }

    handleSearch() {
        if (!this.isValidSearchTerm) {
            this.errorMessage = 'Please enter valid search criteria';
            return;
        }

        this.performSearch();
    }

    handleSelectResult(event) {
        const selectedABN = event.target.dataset.abn;
        const selectedResult = this.searchResults.find(result => result.abnNumber === selectedABN);
        
        // Dispatch custom event to parent
        const selectEvent = new CustomEvent('abnselected', {
            detail: {
                componentName: 'abnLookupTestV2',
                selectedABN: selectedABN,
                selectedResult: selectedResult,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectEvent);
    }

    // Private methods
    detectSearchType() {
        if (!this.searchTerm) {
            this.searchType = 'name';
            return;
        }

        const trimmedTerm = this.searchTerm.trim();
        
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
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

            const response = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (response.success) {
                this.searchResults = this.processSearchResults(response.data);
                this.dispatchSuccessEvent('Search completed successfully');
            } else {
                this.errorMessage = response.message || 'Search failed. Please try again.';
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

    processSearchResults(data) {
        if (!data) return [];

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map((item, index) => {
            return {
                id: `result-${index}`,
                abnNumber: this.getNestedValue(item, 'abn.identifier_value') || 'N/A',
                entityName: this.getNestedValue(item, 'other_trading_name.organisation_name') || 'N/A',
                abnStatus: this.getNestedValue(item, 'entity_status.entity_status_code') || 'N/A',
                entityType: this.getNestedValue(item, 'entity_type.entity_description') || 'N/A',
                asicNumber: item.asic_number || 'N/A',
                gstStatus: this.getNestedValue(item, 'goods_and_services_tax.effective_from') ? 'Registered' : 'Not Registered',
                dgrEndorsement: this.getNestedValue(item, 'dgr_endorsement.entity_endorsement') || 'N/A',
                lastUpdated: this.formatDate(item.record_last_updated_date)
            };
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return dateString;
        }
    }

    clearResults() {
        this.searchResults = [];
        this.errorMessage = '';
    }

    dispatchSuccessEvent(message) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'abnLookupTestV2',
                message: message,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV2',
                errorMessage: errorMessage,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.clearResults();
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
        this.clearResults();
        this.searchType = 'name';
    }
}
