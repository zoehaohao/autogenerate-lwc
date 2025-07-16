import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchABN from '@salesforce/apex/NEWabnLookupTestV2Controller.searchABN';

export default class NEWabnLookupTestV2 extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;
    @api showSelectButton = true;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track allResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';
    @track hasSearched = false;

    // Search type constants
    SEARCH_TYPES = {
        ABN: 'abn',
        ACN: 'acn',
        NAME: 'name'
    };

    // Component lifecycle
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
            this.detectSearchType();
        }
    }

    // Getters for dynamic properties
    get searchPlaceholder() {
        switch (this.searchType) {
            case this.SEARCH_TYPES.ABN:
                return 'Enter 11-digit ABN (e.g., 12345678901)';
            case this.SEARCH_TYPES.ACN:
                return 'Enter 9-digit ACN (e.g., 123456789)';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchButtonLabel() {
        return this.searchType === this.SEARCH_TYPES.NAME ? 'Search' : 'Verify';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.trim().length < 2;
    }

    get hasResults() {
        return !this.isLoading && this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && this.hasSearched && (!this.searchResults || this.searchResults.length === 0) && !this.errorMessage;
    }

    get showPagination() {
        return this.allResults && this.allResults.length > 10;
    }

    // Event handlers
    handleSearchInputChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
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
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('resultselected', {
                detail: {
                    selectedResult: selectedResult,
                    searchTerm: this.searchTerm,
                    searchType: this.searchType,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);

            // Show success toast
            this.showToast('Success', `Selected: ${selectedResult.entityName}`, 'success');
        }
    }

    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Search functionality
    detectSearchType() {
        const term = this.searchTerm.trim();
        
        if (/^\d{11}$/.test(term)) {
            this.searchType = this.SEARCH_TYPES.ABN;
        } else if (/^\d{9}$/.test(term)) {
            this.searchType = this.SEARCH_TYPES.ACN;
        } else {
            this.searchType = this.SEARCH_TYPES.NAME;
        }
    }

    validateInput() {
        const term = this.searchTerm.trim();
        
        switch (this.searchType) {
            case this.SEARCH_TYPES.ABN:
                if (!/^\d{11}$/.test(term)) {
                    this.showError('Please enter a valid 11-digit ABN number');
                    return false;
                }
                break;
            case this.SEARCH_TYPES.ACN:
                if (!/^\d{9}$/.test(term)) {
                    this.showError('Please enter a valid 9-digit ACN number');
                    return false;
                }
                break;
            case this.SEARCH_TYPES.NAME:
                if (term.length < 2) {
                    this.showError('Company name must be at least 2 characters long');
                    return false;
                }
                break;
        }
        
        return true;
    }

    async performSearch() {
        this.isLoading = true;
        this.clearMessages();
        this.hasSearched = true;

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN(searchParams);
            
            if (result.success) {
                this.processSearchResults(result.data);
                
                // Dispatch search complete event
                const searchEvent = new CustomEvent('searchcomplete', {
                    detail: {
                        results: this.allResults,
                        searchTerm: this.searchTerm,
                        searchType: this.searchType,
                        resultCount: this.allResults.length,
                        timestamp: new Date().toISOString()
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(searchEvent);
                
            } else {
                this.showError(result.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('An unexpected error occurred. Please try again.');
            
            // Dispatch error event
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'NEWabnLookupTestV2',
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
            this.allResults = [];
            this.searchResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.allResults = results.map((item, index) => ({
            id: `result-${index}-${Date.now()}`,
            abnNumber: this.getFieldValue(item, 'abn.identifier_value'),
            entityName: this.getFieldValue(item, 'other_trading_name.organisation_name') || 'N/A',
            abnStatus: this.formatAbnStatus(item),
            entityType: this.getFieldValue(item, 'entity_type.entity_description'),
            gstStatus: this.formatGstStatus(item),
            mainBusinessLocation: this.getFieldValue(item, 'main_business_location') || 'N/A',
            asicNumber: this.getFieldValue(item, 'asic_number'),
            dgrEndorsement: this.formatDgrEndorsement(item),
            rawData: item
        }));

        // Set initial paginated results
        this.searchResults = this.allResults.slice(0, 10);
    }

    // Utility methods
    getFieldValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
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

    formatDgrEndorsement(item) {
        const endorsement = this.getFieldValue(item, 'dgr_endorsement.entity_endorsement');
        const itemNumber = this.getFieldValue(item, 'dgr_endorsement.item_number');
        
        if (endorsement && itemNumber) {
            return `${endorsement} - ${itemNumber}`;
        }
        return endorsement || 'N/A';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return 'N/A';
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

    clearMessages() {
        this.errorMessage = '';
    }

    showError(message) {
        this.errorMessage = message;
        this.showToast('Error', message, 'error');
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm) {
            this.performSearch();
        }
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.allResults = [];
        this.clearMessages();
        this.hasSearched = false;
    }

    @api
    setSearchTerm(term) {
        this.searchTerm = term;
        this.detectSearchType();
    }

    @api
    validateComponent() {
        return {
            isValid: !this.errorMessage && (this.hasResults || !this.hasSearched),
            hasResults: this.hasResults,
            resultCount: this.allResults.length,
            searchTerm: this.searchTerm
        };
    }
}
