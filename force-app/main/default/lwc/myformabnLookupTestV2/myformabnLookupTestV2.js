import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchABN from '@salesforce/apex/myformabnLookupTestV2Controller.searchABN';

export default class MyformabnLookupTestV2 extends LightningElement {
    // Public API properties for parent components
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;
    @api showSelectButton = true;
    @api enablePagination = true;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track allResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';
    @track hasSearched = false;

    // Search debounce timer
    searchTimeout;

    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
        }
    }

    // Getters for dynamic properties
    get searchPlaceholder() {
        switch (this.searchType) {
            case 'abn':
                return 'Enter 11-digit ABN (e.g., 12345678901)';
            case 'acn':
                return 'Enter 9-digit ACN (e.g., 123456789)';
            default:
                return 'Search by Business Name, ABN or ACN';
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

    get hasResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.hasSearched && 
               (!this.searchResults || this.searchResults.length === 0);
    }

    get showPagination() {
        return this.enablePagination && this.allResults && this.allResults.length > 10;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearError();
        
        // Clear previous search results if search term is cleared
        if (!this.searchTerm) {
            this.searchResults = [];
            this.allResults = [];
            this.hasSearched = false;
        }
    }

    handleKeyUp(event) {
        // Trigger search on Enter key
        if (event.keyCode === 13) {
            this.handleSearch();
        }
    }

    handleSearch() {
        if (this.isSearchDisabled) {
            return;
        }

        // Validate input based on search type
        if (!this.validateInput()) {
            return;
        }

        // Debounce search requests
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
        }, 300);
    }

    handleSelectBusiness(event) {
        const businessId = event.target.dataset.businessId;
        const selectedBusiness = this.searchResults.find(result => result.id === businessId);
        
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

            // Show success toast
            this.showToast('Success', `Selected: ${selectedBusiness.entityName}`, 'success');
        }
    }

    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
        
        // Notify parent of pagination change
        const paginationEvent = new CustomEvent('paginationchange', {
            detail: {
                currentPage: event.detail.currentPage,
                pageSize: event.detail.pageSize,
                totalPages: event.detail.totalPages,
                paginatedData: this.searchResults
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(paginationEvent);
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Helper methods
    detectSearchType() {
        if (!this.searchTerm) {
            this.searchType = 'name';
            return;
        }

        const cleanTerm = this.searchTerm.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(cleanTerm)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(cleanTerm)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }

    validateInput() {
        const cleanTerm = this.searchTerm.replace(/\s/g, '');
        
        switch (this.searchType) {
            case 'abn':
                if (!/^\d{11}$/.test(cleanTerm)) {
                    this.setError('Please enter a valid 11-digit ABN number');
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(cleanTerm)) {
                    this.setError('Please enter a valid 9-digit ACN number');
                    return false;
                }
                break;
            case 'name':
                if (this.searchTerm.length < 2) {
                    this.setError('Please enter at least 2 characters for company name search');
                    return false;
                }
                break;
        }
        return true;
    }

    async performSearch() {
        this.isLoading = true;
        this.clearError();
        this.hasSearched = true;

        try {
            const searchParams = {
                searchTerm: this.searchTerm,
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
                
                // Dispatch success event to parent
                const successEvent = new CustomEvent('searchcomplete', {
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
                this.dispatchEvent(successEvent);
            } else {
                this.setError(result.message || 'Search failed. Please try again.');
                
                // Dispatch error event to parent
                this.dispatchErrorEvent(result.message || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.setError('An unexpected error occurred. Please try again.');
            this.dispatchErrorEvent(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data) {
            this.searchResults = [];
            this.allResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.allResults = results.map((item, index) => ({
            id: `result-${index}-${Date.now()}`,
            entityName: this.extractEntityName(item),
            abnNumber: this.extractABNNumber(item),
            abnStatus: this.extractABNStatus(item),
            entityType: this.extractEntityType(item),
            acnNumber: this.extractACNNumber(item),
            gstStatus: this.extractGSTStatus(item),
            businessLocation: this.extractBusinessLocation(item),
            lastUpdated: this.extractLastUpdated(item),
            rawData: item
        }));

        // Set initial paginated results
        if (this.enablePagination && this.allResults.length > 10) {
            this.searchResults = this.allResults.slice(0, 10);
        } else {
            this.searchResults = [...this.allResults];
        }
    }

    // Data extraction methods
    extractEntityName(data) {
        return data.other_trading_name?.organisation_name || 
               data.entity_name?.organisation_name || 
               data.organisation_name || 
               'Unknown Entity';
    }

    extractABNNumber(data) {
        return data.abn?.identifier_value || data.abn_number || '';
    }

    extractABNStatus(data) {
        const status = data.entity_status?.entity_status_code || data.abn_status || '';
        const effectiveFrom = data.entity_status?.effective_from || '';
        return effectiveFrom ? `${status} from ${this.formatDate(effectiveFrom)}` : status;
    }

    extractEntityType(data) {
        return data.entity_type?.entity_description || 
               data.entity_type?.entity_type_code || 
               data.entity_type || '';
    }

    extractACNNumber(data) {
        return data.asic_number || data.acn_number || '';
    }

    extractGSTStatus(data) {
        const gst = data.goods_and_services_tax;
        if (gst && gst.effective_from && gst.effective_from !== '0001-01-01') {
            return `Registered from ${this.formatDate(gst.effective_from)}`;
        }
        return '';
    }

    extractBusinessLocation(data) {
        return data.main_business_location || data.business_location || '';
    }

    extractLastUpdated(data) {
        return data.record_last_updated_date ? this.formatDate(data.record_last_updated_date) : '';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return '';
        }
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-AU');
        } catch (error) {
            return dateString;
        }
    }

    setError(message) {
        this.errorMessage = message;
        this.searchResults = [];
        this.allResults = [];
    }

    clearError() {
        this.errorMessage = '';
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'myformabnLookupTestV2',
                errorMessage: errorMessage,
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

    // Public API methods for parent components
    @api
    refreshSearch() {
        if (this.searchTerm) {
            this.performSearch();
        }
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.allResults = [];
        this.hasSearched = false;
        this.clearError();
    }

    @api
    validateComponent() {
        return {
            isValid: !this.errorMessage && (this.searchResults.length > 0 || !this.hasSearched),
            errorMessage: this.errorMessage,
            hasResults: this.hasResults,
            resultCount: this.searchResults.length
        };
    }

    @api
    getSelectedResults() {
        return this.searchResults;
    }

    @api
    setSearchTerm(term) {
        this.searchTerm = term;
        this.detectSearchType();
    }
}
