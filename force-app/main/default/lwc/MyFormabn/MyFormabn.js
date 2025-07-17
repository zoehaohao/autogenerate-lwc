import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/MyFormabnController.searchABN';

export default class MyFormabn extends LightningElement {
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
    @track currentPage = 1;
    @track pageSize = 10;

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
            default:
                return trimmedTerm.length >= 2;
        }
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && this.searchResults.length === 0 && this.searchTerm;
    }

    get showPagination() {
        return this.hasResults && this.searchResults.length > this.pageSize;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
    }

    detectSearchType() {
        if (!this.searchTerm) {
            this.searchType = 'name';
            return;
        }

        const trimmedTerm = this.searchTerm.trim().replace(/\s/g, '');
        
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }

    async handleSearch() {
        if (!this.isValidSearchTerm) {
            this.errorMessage = 'Please enter a valid search term';
            return;
        }

        this.isLoading = true;
        this.clearMessages();
        this.searchResults = [];
        this.paginatedResults = [];

        try {
            const result = await searchABN({
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            });

            if (result.success) {
                this.searchResults = this.processSearchResults(result.data);
                this.updatePaginatedResults();
                
                // Dispatch success event to parent
                this.dispatchSuccessEvent({
                    searchTerm: this.searchTerm,
                    searchType: this.searchType,
                    resultCount: this.searchResults.length
                });
            } else {
                this.errorMessage = result.message || 'An error occurred while searching';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.dispatchErrorEvent(this.errorMessage);
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data) return [];

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map((item, index) => {
            const abnValue = item.abn?.identifier_value || '';
            const entityName = item.other_trading_name?.organisation_name || 'Unknown Entity';
            const entityStatus = item.entity_status?.entity_status_code || 'Unknown';
            const effectiveFrom = item.entity_status?.effective_from || '';
            const entityType = item.entity_type?.entity_description || 'Unknown';
            const gstFrom = item.goods_and_services_tax?.effective_from || '';
            const businessLocation = item.main_business_location || 'Not specified';

            return {
                id: `result-${index}-${abnValue}`,
                abnNumber: this.formatABN(abnValue),
                entityName: entityName,
                abnStatus: effectiveFrom ? `${entityStatus} from ${this.formatDate(effectiveFrom)}` : entityStatus,
                entityType: entityType,
                gstStatus: gstFrom ? `Registered from ${this.formatDate(gstFrom)}` : 'Not registered',
                businessLocation: businessLocation,
                rawData: item
            };
        });
    }

    formatABN(abn) {
        if (!abn || abn.length !== 11) return abn;
        return `${abn.substring(0, 2)} ${abn.substring(2, 5)} ${abn.substring(5, 8)} ${abn.substring(8)}`;
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

    updatePaginatedResults() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedResults = this.searchResults.slice(startIndex, endIndex);
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
        this.currentPage = event.detail.currentPage;
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize;
        this.currentPage = 1;
        this.updatePaginatedResults();
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('resultselected', {
                detail: {
                    selectedResult: selectedResult,
                    abnNumber: selectedResult.abnNumber,
                    entityName: selectedResult.entityName,
                    rawData: selectedResult.rawData
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);
        }
    }

    clearMessages() {
        this.errorMessage = '';
    }

    dispatchSuccessEvent(data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'MyFormabn',
                result: data,
                message: 'Search completed successfully',
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
                componentName: 'MyFormabn',
                errorMessage: errorMessage,
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
        this.searchResults = [];
        this.paginatedResults = [];
        this.clearMessages();
    }

    @api
    validateComponent() {
        return this.isValidSearchTerm;
    }

    @api
    performSearch(searchTerm, searchType) {
        this.searchTerm = searchTerm;
        this.searchType = searchType || 'name';
        this.handleSearch();
    }
}
