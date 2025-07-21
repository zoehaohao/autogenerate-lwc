import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupController.searchABN';

export default class AbnLookup extends LightningElement {
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
                return 'Enter ABN, ACN, or company name';
        }
    }

    get searchTypeIndicator() {
        if (!this.searchType) return '';
        switch (this.searchType) {
            case 'ABN':
                return 'Searching by ABN Number';
            case 'ACN':
                return 'Searching by ACN Number';
            case 'NAME':
                return 'Searching by Company Name';
            default:
                return '';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    get hasResults() {
        return !this.isLoading && this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && this.hasSearched && (!this.searchResults || this.searchResults.length === 0) && !this.errorMessage;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearResults();
    }

    handleSearch() {
        if (this.validateInput()) {
            this.performSearch();
        }
    }

    // Search type detection
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

    // Validation
    validateInput() {
        const term = this.searchTerm.trim();
        
        if (!term) {
            this.showError('Please enter a search term');
            return false;
        }

        switch (this.searchType) {
            case 'ABN':
                if (!/^\d{11}$/.test(term)) {
                    this.showError('ABN must be exactly 11 digits');
                    return false;
                }
                break;
            case 'ACN':
                if (!/^\d{9}$/.test(term)) {
                    this.showError('ACN must be exactly 9 digits');
                    return false;
                }
                break;
            case 'NAME':
                if (term.length < 2) {
                    this.showError('Company name must be at least 2 characters');
                    return false;
                }
                break;
            default:
                this.showError('Please enter a valid ABN (11 digits), ACN (9 digits), or company name');
                return false;
        }

        return true;
    }

    // Search execution
    async performSearch() {
        this.isLoading = true;
        this.clearResults();
        this.hasSearched = true;

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });

            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSuccessEvent(result.data);
            } else {
                this.showError(result.message || 'Search failed');
                this.dispatchErrorEvent(result.message);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('An unexpected error occurred. Please try again.');
            this.dispatchErrorEvent(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    // Result processing
    processSearchResults(data) {
        if (!data) {
            this.searchResults = [];
            return;
        }

        // Handle single result or array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((result, index) => {
            return {
                id: `result-${index}`,
                ...result,
                abnStatusVariant: this.getAbnStatusVariant(result.abn?.is_current_indicator),
                formattedEffectiveFrom: this.formatDate(result.entity_status?.effective_from),
                formattedGstFrom: this.formatDate(result.goods_and_services_tax?.effective_from),
                formattedLastUpdated: this.formatDate(result.record_last_updated_date)
            };
        });
    }

    // Utility methods
    getAbnStatusVariant(status) {
        return status === 'Y' ? 'success' : 'warning';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return '';
        }
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (error) {
            return dateString;
        }
    }

    showError(message) {
        this.errorMessage = message;
        setTimeout(() => {
            this.errorMessage = '';
        }, 5000);
    }

    clearResults() {
        this.searchResults = [];
        this.errorMessage = '';
        this.hasSearched = false;
    }

    // Parent-child communication
    dispatchSuccessEvent(result) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'abnLookup',
                result: result,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                message: 'Search completed successfully',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookup',
                errorMessage: error,
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
        if (this.searchTerm && this.validateInput()) {
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
        this.searchType = '';
        this.clearResults();
    }
}
