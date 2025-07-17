import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/mynewabnLookupTestV2Controller.searchABN';

export default class MynewabnLookupTestV2 extends LightningElement {
    // Public API properties for parent components
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name'; // 'abn', 'acn', 'name'

    // Component state
    hasSearched = false;
    currentPage = 1;
    pageSize = 10;

    // Initialize component
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
        }
    }

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
        switch (this.searchType) {
            case 'abn':
            case 'acn':
                return 'Verify';
            default:
                return 'Search';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2 || this.isReadOnly;
    }

    get showError() {
        return this.errorMessage && this.errorMessage.length > 0;
    }

    get showResults() {
        return !this.isLoading && !this.showError && this.searchResults.length > 0 && !this.showSelectedResult;
    }

    get showNoResults() {
        return !this.isLoading && !this.showError && this.hasSearched && this.searchResults.length === 0 && !this.showSelectedResult;
    }

    get showPagination() {
        return this.searchResults.length > this.pageSize;
    }

    get showSelectedResult() {
        return this.selectedResult !== null;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearError();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13 && !this.isSearchDisabled) {
            this.handleSearch();
        }
    }

    handleSearch() {
        if (this.isSearchDisabled) {
            return;
        }

        if (!this.validateInput()) {
            return;
        }

        this.performSearch();
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.searchResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = { ...selected };
            
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('abnselected', {
                detail: {
                    selectedABN: this.selectedResult,
                    searchTerm: this.searchTerm,
                    searchType: this.searchType,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);
        }
    }

    handleChangeABN() {
        this.selectedResult = null;
        this.clearResults();
        
        // Dispatch change event to parent
        const changeEvent = new CustomEvent('abnchanged', {
            detail: {
                previousSelection: this.selectedResult,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
        this.currentPage = event.detail.currentPage;
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize;
    }

    // Search functionality
    detectSearchType() {
        const term = this.searchTerm.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(term)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(term)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }

    validateInput() {
        const term = this.searchTerm.trim();
        
        if (!term) {
            this.setError('Please enter a search term');
            return false;
        }

        switch (this.searchType) {
            case 'abn':
                if (!/^\d{11}$/.test(term.replace(/\s/g, ''))) {
                    this.setError('ABN must be exactly 11 digits');
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(term.replace(/\s/g, ''))) {
                    this.setError('ACN must be exactly 9 digits');
                    return false;
                }
                break;
            case 'name':
                if (term.length < 2) {
                    this.setError('Company name must be at least 2 characters');
                    return false;
                }
                break;
        }

        return true;
    }

    async performSearch() {
        this.isLoading = true;
        this.clearError();
        this.clearResults();

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });

            if (result.success) {
                this.processSearchResults(result.data);
                this.hasSearched = true;
                
                // Dispatch search completed event
                const searchEvent = new CustomEvent('searchcompleted', {
                    detail: {
                        searchTerm: this.searchTerm,
                        searchType: this.searchType,
                        resultCount: this.searchResults.length,
                        timestamp: new Date().toISOString()
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(searchEvent);
            } else {
                this.setError(result.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.setError('An unexpected error occurred. Please try again.');
            
            // Dispatch error event
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'mynewabnLookupTestV2',
                    errorMessage: error.message,
                    searchTerm: this.searchTerm,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(errorEvent);
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
                abnNumber: this.extractABNNumber(item),
                entityName: this.extractEntityName(item),
                abnStatus: this.extractABNStatus(item),
                entityType: this.extractEntityType(item),
                gstStatus: this.extractGSTStatus(item),
                businessLocation: this.extractBusinessLocation(item),
                rawData: item
            };
        });

        // Initialize pagination
        this.paginatedResults = this.searchResults.slice(0, this.pageSize);
    }

    // Data extraction methods
    extractABNNumber(data) {
        if (data.abn && data.abn.identifier_value) {
            return data.abn.identifier_value;
        }
        return 'N/A';
    }

    extractEntityName(data) {
        if (data.other_trading_name && data.other_trading_name.organisation_name) {
            return data.other_trading_name.organisation_name;
        }
        return 'N/A';
    }

    extractABNStatus(data) {
        if (data.entity_status) {
            const status = data.entity_status.entity_status_code || 'Unknown';
            const effectiveFrom = data.entity_status.effective_from;
            if (effectiveFrom && effectiveFrom !== '0001-01-01') {
                return `${status} from ${this.formatDate(effectiveFrom)}`;
            }
            return status;
        }
        return 'N/A';
    }

    extractEntityType(data) {
        if (data.entity_type && data.entity_type.entity_description) {
            return data.entity_type.entity_description;
        }
        return 'N/A';
    }

    extractGSTStatus(data) {
        if (data.goods_and_services_tax) {
            const effectiveFrom = data.goods_and_services_tax.effective_from;
            if (effectiveFrom && effectiveFrom !== '0001-01-01') {
                return `Registered from ${this.formatDate(effectiveFrom)}`;
            }
            return 'Registered';
        }
        return 'Not registered';
    }

    extractBusinessLocation(data) {
        // This would typically come from address data in the API response
        // For now, using a placeholder based on common Australian states
        return 'VIC 3123'; // This should be extracted from actual address data
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return '';
        }
        
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

    // Utility methods
    setError(message) {
        this.errorMessage = message;
    }

    clearError() {
        this.errorMessage = '';
    }

    clearResults() {
        this.searchResults = [];
        this.paginatedResults = [];
    }

    // Public API methods for parent components
    @api
    performExternalSearch(searchTerm, searchType) {
        this.searchTerm = searchTerm;
        this.searchType = searchType || 'name';
        return this.performSearch();
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.clearResults();
        this.clearError();
        this.selectedResult = null;
        this.hasSearched = false;
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    validateComponent() {
        return {
            isValid: !this.showError && (this.selectedResult !== null || !this.hasSearched),
            selectedResult: this.selectedResult,
            hasSearched: this.hasSearched
        };
    }
}
