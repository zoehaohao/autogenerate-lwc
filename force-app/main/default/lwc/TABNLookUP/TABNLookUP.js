import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/TABNLookUPController.searchABN';

export default class TABNLookUP extends LightningElement {
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

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.trim().length < 2;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading;
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
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (this.isSearchDisabled) {
            return;
        }

        if (!this.validateInput()) {
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
                this.dispatchSearchSuccess(result.data);
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.searchResults = [];
                this.dispatchError(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.searchResults = [];
            this.dispatchError(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selectedResult = this.searchResults.find(result => result.id === selectedId);
        
        if (selectedResult) {
            this.dispatchSelectionEvent(selectedResult);
        }
    }

    // Helper methods
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
        
        switch (this.searchType) {
            case 'ABN':
                if (!/^\d{11}$/.test(term)) {
                    this.errorMessage = 'ABN must be exactly 11 digits';
                    return false;
                }
                break;
            case 'ACN':
                if (!/^\d{9}$/.test(term)) {
                    this.errorMessage = 'ACN must be exactly 9 digits';
                    return false;
                }
                break;
            case 'NAME':
                if (term.length < 2) {
                    this.errorMessage = 'Company name must be at least 2 characters';
                    return false;
                }
                break;
            default:
                this.errorMessage = 'Please enter a valid ABN, ACN, or company name';
                return false;
        }
        
        return true;
    }

    processSearchResults(data) {
        if (!data) return [];
        
        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map((item, index) => {
            return {
                id: `result-${index}`,
                abnNumber: item.abn?.identifier_value || 'N/A',
                entityName: item.other_trading_name?.organisation_name || 'N/A',
                abnStatus: item.entity_status?.entity_status_code ? 
                    `${item.entity_status.entity_status_code} from ${this.formatDate(item.entity_status.effective_from)}` : 'N/A',
                entityType: item.entity_type?.entity_description || 'N/A',
                gstStatus: item.goods_and_services_tax?.effective_from ? 
                    `Registered from ${this.formatDate(item.goods_and_services_tax.effective_from)}` : 'N/A',
                mainBusinessLocation: item.main_business_location || 'N/A',
                asicNumber: item.asic_number || 'N/A',
                lastUpdated: this.formatDate(item.record_last_updated_date),
                rawData: item
            };
        });
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') return 'N/A';
        
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

    clearMessages() {
        this.errorMessage = '';
    }

    // Public API methods
    @api
    refreshData() {
        if (this.searchTerm) {
            this.handleSearch();
        }
    }

    @api
    validateComponent() {
        return this.validateInput();
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.searchType = '';
        this.hasSearched = false;
        this.clearMessages();
    }

    // Custom event dispatchers
    dispatchSearchSuccess(data) {
        const successEvent = new CustomEvent('searchsuccess', {
            detail: {
                componentName: 'TABNLookUP',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                results: data,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('entityselected', {
            detail: {
                componentName: 'TABNLookUP',
                selectedEntity: selectedResult,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchError(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'TABNLookUP',
                errorMessage: error,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }
}
