import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/TestabnLookupV2Controller.searchABN';

export default class TestabnLookupV2 extends LightningElement {
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
    @track hasSearched = false;

    searchTimeout;

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

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm.trim() || this.validationError;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return this.hasSearched && !this.isLoading && !this.hasResults && !this.errorMessage;
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.validateInput();
        this.clearMessages();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13 && !this.isSearchDisabled) {
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

        switch (this.searchType) {
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
                if (term.length > 0 && term.length < 2 && !/^\d+$/.test(term)) {
                    this.validationError = 'Please enter at least 2 characters for company name search';
                }
                break;
        }
    }

    async handleSearch() {
        if (this.isSearchDisabled) {
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
                this.dispatchSearchSuccessEvent();
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.searchResults = [];
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.searchResults = [];
            this.dispatchErrorEvent(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data) {
            return [];
        }

        // Handle single result or array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map((item, index) => {
            return {
                id: `result-${index}`,
                abnNumber: item.abn?.identifier_value || 'N/A',
                entityName: item.other_trading_name?.organisation_name || 'Unknown Entity',
                abnStatus: item.entity_status?.entity_status_code || 'Unknown',
                entityType: item.entity_type?.entity_description || 'N/A',
                asicNumber: item.asic_number || 'N/A',
                effectiveFrom: this.formatDate(item.entity_status?.effective_from),
                gstStatus: item.goods_and_services_tax ? 'Registered' : 'Not Registered',
                dgrEndorsement: item.dgr_endorsement?.entity_endorsement || 'Not Endorsed',
                rawData: item
            };
        });
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return 'N/A';
        }
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
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

    handleClearResults() {
        this.searchResults = [];
        this.searchTerm = '';
        this.hasSearched = false;
        this.clearMessages();
        this.searchType = '';
    }

    clearMessages() {
        this.errorMessage = '';
        this.validationError = '';
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
        this.validateInput();
        return !this.validationError;
    }

    @api
    clearSearch() {
        this.handleClearResults();
    }

    // Custom events for parent communication
    dispatchSearchSuccessEvent() {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'TestabnLookupV2',
                results: this.searchResults,
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

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('resultselected', {
            detail: {
                componentName: 'TestabnLookupV2',
                selectedResult: selectedResult,
                searchTerm: this.searchTerm,
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
                componentName: 'TestabnLookupV2',
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
