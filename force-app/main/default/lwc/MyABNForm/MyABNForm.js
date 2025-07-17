import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/MyABNFormController.searchABN';

export default class MyABNForm extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
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

    get searchButtonLabel() {
        return this.searchType === 'abn' ? 'Verify' : 'Search';
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
                return /^\d{11}$/.test(trimmedTerm.replace(/\s/g, ''));
            case 'acn':
                return /^\d{9}$/.test(trimmedTerm.replace(/\s/g, ''));
            case 'name':
                return trimmedTerm.length >= 2;
            default:
                return false;
        }
    }

    get showError() {
        return !this.isLoading && this.errorMessage && this.errorMessage.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length === 0 && this.hasSearched;
    }

    get showResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length > 0;
    }

    get showPagination() {
        return this.searchResults.length > 10;
    }

    hasSearched = false;

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearResults();
    }

    detectSearchType() {
        const trimmedTerm = this.searchTerm.trim().replace(/\s/g, '');
        
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }

    handleSearch() {
        if (!this.isValidSearchTerm) {
            return;
        }

        this.performSearch();
    }

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
                this.dispatchSearchSuccessEvent(result.data);
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again.';
            this.dispatchErrorEvent(this.errorMessage);
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
                abn: this.extractABN(item),
                entityName: this.extractEntityName(item),
                abnStatus: this.extractABNStatus(item),
                entityType: this.extractEntityType(item),
                gstStatus: this.extractGSTStatus(item),
                businessLocation: this.extractBusinessLocation(item),
                rawData: item
            };
        });

        // Initialize pagination with first page
        this.updatePaginatedResults();
    }

    extractABN(item) {
        return item.abn?.identifier_value || item.abn || 'N/A';
    }

    extractEntityName(item) {
        return item.entity_name || item.other_trading_name?.organisation_name || item.name || 'N/A';
    }

    extractABNStatus(item) {
        const status = item.entity_status?.entity_status_code || item.status || 'Unknown';
        const effectiveFrom = item.entity_status?.effective_from || '';
        return effectiveFrom ? `${status} from ${this.formatDate(effectiveFrom)}` : status;
    }

    extractEntityType(item) {
        return item.entity_type?.entity_description || item.entity_type?.entity_type_code || item.type || 'N/A';
    }

    extractGSTStatus(item) {
        const gst = item.goods_and_services_tax;
        if (gst && gst.effective_from) {
            return `Registered from ${this.formatDate(gst.effective_from)}`;
        }
        return item.gst_status || 'Not registered';
    }

    extractBusinessLocation(item) {
        return item.business_location || item.asic_number || 'N/A';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return '';
        }
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return dateString;
        }
    }

    updatePaginatedResults() {
        // Default to first 10 results if no pagination component
        this.paginatedResults = this.searchResults.slice(0, 10);
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData || [];
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            this.dispatchSelectionEvent(selectedResult);
        }
    }

    clearResults() {
        this.searchResults = [];
        this.paginatedResults = [];
        this.errorMessage = '';
        this.hasSearched = false;
    }

    // Parent communication methods
    dispatchSearchSuccessEvent(data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'MyABNForm',
                result: data,
                message: 'Search completed successfully',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                resultCount: this.searchResults.length,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'MyABNForm',
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

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('abnselected', {
            detail: {
                componentName: 'MyABNForm',
                selectedResult: selectedResult,
                searchTerm: this.searchTerm,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.clearResults();
    }

    @api
    validateComponent() {
        return this.isValidSearchTerm;
    }

    @api
    performSearchFromParent(searchTerm, searchType) {
        this.searchTerm = searchTerm || '';
        this.searchType = searchType || 'name';
        if (this.isValidSearchTerm) {
            this.performSearch();
        }
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.clearResults();
    }
}
