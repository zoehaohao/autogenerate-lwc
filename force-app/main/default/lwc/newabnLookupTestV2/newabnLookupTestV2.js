import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newabnLookupTestV2Controller.searchABN';

export default class NewabnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
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

    get showPagination() {
        return this.allResults && this.allResults.length > 10;
    }

    // Event handlers
    handleSearchChange(event) {
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

    handleSearch() {
        if (this.validateInput()) {
            this.performSearch();
        }
    }

    handleSelectBusiness(event) {
        const selectedId = event.target.dataset.id;
        const selectedBusiness = this.searchResults.find(result => result.id === selectedId);
        
        if (selectedBusiness) {
            // Dispatch custom event to parent
            const selectEvent = new CustomEvent('businessselected', {
                detail: {
                    selectedBusiness: selectedBusiness,
                    searchTerm: this.searchTerm,
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

    // Search type detection
    detectSearchType() {
        const term = this.searchTerm.replace(/\s/g, '');
        
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

    // Input validation
    validateInput() {
        this.validationError = '';
        
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            this.validationError = 'Please enter a search term';
            return false;
        }

        const term = this.searchTerm.replace(/\s/g, '');
        
        switch(this.searchType) {
            case 'ABN':
                if (!/^\d{11}$/.test(term)) {
                    this.validationError = 'ABN must be exactly 11 digits';
                    return false;
                }
                break;
            case 'ACN':
                if (!/^\d{9}$/.test(term)) {
                    this.validationError = 'ACN must be exactly 9 digits';
                    return false;
                }
                break;
            case 'NAME':
                if (term.length < 2) {
                    this.validationError = 'Company name must be at least 2 characters';
                    return false;
                }
                break;
            default:
                this.validationError = 'Please enter a valid ABN (11 digits), ACN (9 digits), or company name (minimum 2 characters)';
                return false;
        }
        
        return true;
    }

    // API search
    async performSearch() {
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
                
                // Dispatch success event to parent
                const successEvent = new CustomEvent('searchsuccess', {
                    detail: {
                        componentName: 'newabnLookupTestV2',
                        searchTerm: this.searchTerm,
                        searchType: this.searchType,
                        resultCount: this.allResults.length,
                        timestamp: new Date().toISOString()
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(successEvent);
            } else {
                this.errorMessage = result.message || 'An error occurred while searching';
                
                // Dispatch error event to parent
                const errorEvent = new CustomEvent('searcherror', {
                    detail: {
                        componentName: 'newabnLookupTestV2',
                        errorMessage: this.errorMessage,
                        searchTerm: this.searchTerm,
                        timestamp: new Date().toISOString()
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(errorEvent);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            
            // Dispatch error event to parent
            const errorEvent = new CustomEvent('searcherror', {
                detail: {
                    componentName: 'newabnLookupTestV2',
                    errorMessage: this.errorMessage,
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

    // Process search results
    processSearchResults(data) {
        if (!data) {
            this.allResults = [];
            this.searchResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.allResults = results.map((item, index) => ({
            id: `result-${index}`,
            entityName: this.extractEntityName(item),
            abn: this.extractABN(item),
            entityStatus: this.extractEntityStatus(item),
            entityType: this.extractEntityType(item),
            gstStatus: this.extractGSTStatus(item),
            asicNumber: this.extractAsicNumber(item),
            dgrEndorsement: this.extractDGREndorsement(item),
            rawData: item
        }));

        // Show first 10 results initially
        this.searchResults = this.allResults.slice(0, 10);
    }

    // Data extraction methods
    extractEntityName(data) {
        if (data.other_trading_name && data.other_trading_name.organisation_name) {
            return data.other_trading_name.organisation_name;
        }
        return 'Business Entity';
    }

    extractABN(data) {
        if (data.abn && data.abn.identifier_value) {
            return data.abn.identifier_value;
        }
        return '';
    }

    extractEntityStatus(data) {
        if (data.entity_status && data.entity_status.entity_status_code) {
            const status = data.entity_status.entity_status_code;
            const effectiveFrom = data.entity_status.effective_from;
            return effectiveFrom ? `${status} from ${effectiveFrom}` : status;
        }
        return '';
    }

    extractEntityType(data) {
        if (data.entity_type && data.entity_type.entity_description) {
            return data.entity_type.entity_description;
        }
        return '';
    }

    extractGSTStatus(data) {
        if (data.goods_and_services_tax) {
            const gst = data.goods_and_services_tax;
            const effectiveFrom = gst.effective_from;
            return effectiveFrom ? `Registered from ${effectiveFrom}` : 'Registered';
        }
        return '';
    }

    extractAsicNumber(data) {
        return data.asic_number || '';
    }

    extractDGREndorsement(data) {
        if (data.dgr_endorsement && data.dgr_endorsement.entity_endorsement) {
            return data.dgr_endorsement.entity_endorsement;
        }
        return '';
    }

    // Utility methods
    clearResults() {
        this.searchResults = [];
        this.allResults = [];
        this.errorMessage = '';
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm) {
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
        this.validationError = '';
        this.clearResults();
    }

    @api
    getSelectedResults() {
        return this.searchResults;
    }
}
