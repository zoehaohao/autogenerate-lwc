import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newabnLookupTestV2Controller.searchABN';

export default class NewabnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchValue = '';
    @track searchResults = [];
    @track allResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track validationError = '';
    @track searchType = '';
    
    // Computed properties
    get searchPlaceholder() {
        switch(this.searchType) {
            case 'ABN':
                return 'Enter 11-digit ABN number';
            case 'ACN':
                return 'Enter 9-digit ACN number';
            case 'NAME':
                return 'Enter company/business name';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchValue || this.validationError;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.hasResults && !this.errorMessage && this.searchValue;
    }

    get showPagination() {
        return this.allResults && this.allResults.length > 10;
    }

    // Event handlers
    handleSearchChange(event) {
        this.searchValue = event.target.value;
        this.detectSearchType();
        this.validateInput();
        this.clearResults();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    handleSearch() {
        if (this.validateInput()) {
            this.performSearch();
        }
    }

    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selectedResult = this.allResults.find(result => result.id === selectedId);
        
        if (selectedResult) {
            // Dispatch success event to parent
            const selectEvent = new CustomEvent('abnselected', {
                detail: {
                    selectedEntity: selectedResult,
                    searchTerm: this.searchValue,
                    searchType: this.searchType,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectEvent);
        }
    }

    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Private methods
    detectSearchType() {
        const value = this.searchValue.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(value)) {
            this.searchType = 'ABN';
        } else if (/^\d{9}$/.test(value)) {
            this.searchType = 'ACN';
        } else if (value.length >= 2) {
            this.searchType = 'NAME';
        } else {
            this.searchType = '';
        }
    }

    validateInput() {
        this.validationError = '';
        
        if (!this.searchValue || this.searchValue.trim().length === 0) {
            this.validationError = 'Please enter a search term';
            return false;
        }

        const value = this.searchValue.replace(/\s/g, '');
        
        switch(this.searchType) {
            case 'ABN':
                if (!/^\d{11}$/.test(value)) {
                    this.validationError = 'ABN must be exactly 11 digits';
                    return false;
                }
                break;
            case 'ACN':
                if (!/^\d{9}$/.test(value)) {
                    this.validationError = 'ACN must be exactly 9 digits';
                    return false;
                }
                break;
            case 'NAME':
                if (value.length < 2) {
                    this.validationError = 'Company name must be at least 2 characters';
                    return false;
                }
                break;
            default:
                this.validationError = 'Please enter a valid ABN, ACN, or company name';
                return false;
        }
        
        return true;
    }

    async performSearch() {
        this.isLoading = true;
        this.errorMessage = '';
        this.clearResults();

        try {
            const searchParams = {
                searchValue: this.searchValue.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
                
                // Dispatch success event
                const successEvent = new CustomEvent('searchcomplete', {
                    detail: {
                        componentName: 'newabnLookupTestV2',
                        results: this.allResults,
                        searchTerm: this.searchValue,
                        searchType: this.searchType,
                        resultCount: this.allResults.length,
                        timestamp: new Date().toISOString()
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(successEvent);
                
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchErrorEvent(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data) {
            this.allResults = [];
            this.searchResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.allResults = results.map((item, index) => {
            return {
                id: `result-${index}`,
                abnNumber: this.getFieldValue(item, 'abn.identifier_value'),
                entityName: this.getFieldValue(item, 'other_trading_name.organisation_name') || 'N/A',
                abnStatus: this.formatAbnStatus(item),
                entityType: this.getFieldValue(item, 'entity_type.entity_description'),
                gstStatus: this.formatGstStatus(item),
                mainBusinessLocation: this.getFieldValue(item, 'asic_number') || 'N/A',
                rawData: item
            };
        });

        // Set initial paginated results
        this.searchResults = this.allResults.slice(0, 10);
    }

    getFieldValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    formatAbnStatus(item) {
        const status = this.getFieldValue(item, 'entity_status.entity_status_code');
        const effectiveFrom = this.getFieldValue(item, 'entity_status.effective_from');
        
        if (status && effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status || 'N/A';
    }

    formatGstStatus(item) {
        const effectiveFrom = this.getFieldValue(item, 'goods_and_services_tax.effective_from');
        
        if (effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `Registered from ${this.formatDate(effectiveFrom)}`;
        }
        return 'Not registered';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') return '';
        
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

    clearResults() {
        this.searchResults = [];
        this.allResults = [];
        this.errorMessage = '';
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'newabnLookupTestV2',
                errorMessage: errorMessage,
                searchTerm: this.searchValue,
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
        if (this.searchValue) {
            this.performSearch();
        }
    }

    @api
    validateComponent() {
        return this.validateInput();
    }

    @api
    clearSearch() {
        this.searchValue = '';
        this.searchType = '';
        this.validationError = '';
        this.clearResults();
    }
}
