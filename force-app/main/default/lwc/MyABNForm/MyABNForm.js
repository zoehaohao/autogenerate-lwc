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
    @track selectedResult = null;
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
        return this.searchResults && this.searchResults.length > 0 && !this.selectedResult;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && 
               this.searchResults.length === 0 && this.searchTerm && !this.selectedResult;
    }

    get showPagination() {
        return this.searchResults && this.searchResults.length > this.pageSize;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
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

    async handleSearch() {
        if (!this.isValidSearchTerm) {
            this.errorMessage = 'Please enter valid search criteria';
            return;
        }

        this.isLoading = true;
        this.clearMessages();
        this.searchResults = [];
        this.paginatedResults = [];

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
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
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchErrorEvent(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data) return [];
        
        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map((item, index) => ({
            id: `result_${index}`,
            abnNumber: this.extractABNNumber(item),
            entityName: this.extractEntityName(item),
            abnStatus: this.extractABNStatus(item),
            entityType: this.extractEntityType(item),
            gstStatus: this.extractGSTStatus(item),
            businessLocation: this.extractBusinessLocation(item),
            rawData: item
        }));
    }

    extractABNNumber(item) {
        return item.abn?.identifier_value || item.abnNumber || 'N/A';
    }

    extractEntityName(item) {
        return item.other_trading_name?.organisation_name || 
               item.entityName || 
               item.name || 
               'Unknown Entity';
    }

    extractABNStatus(item) {
        const status = item.entity_status?.entity_status_code || item.abnStatus;
        const effectiveFrom = item.entity_status?.effective_from || item.effectiveFrom;
        
        if (status && effectiveFrom) {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status || 'Unknown';
    }

    extractEntityType(item) {
        return item.entity_type?.entity_description || 
               item.entityType || 
               'Unknown Type';
    }

    extractGSTStatus(item) {
        const gstInfo = item.goods_and_services_tax || item.gstInfo;
        if (gstInfo?.effective_from) {
            return `Registered from ${this.formatDate(gstInfo.effective_from)}`;
        }
        return item.gstStatus || 'Not registered';
    }

    extractBusinessLocation(item) {
        return item.businessLocation || 
               item.main_business_location || 
               item.asic_number || 
               'N/A';
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

    handleSelectResult(event) {
        const resultId = event.currentTarget.dataset.resultId;
        const selected = this.searchResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = { ...selected };
            this.searchResults = [];
            this.paginatedResults = [];
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(selected);
        }
    }

    handleChangeABN() {
        this.selectedResult = null;
        this.searchTerm = '';
        this.searchType = 'name';
        this.clearMessages();
        
        // Dispatch change event to parent
        this.dispatchChangeEvent();
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData || [];
        this.currentPage = event.detail.currentPage || 1;
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize || 10;
        this.updatePaginatedResults();
    }

    updatePaginatedResults() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedResults = this.searchResults.slice(startIndex, endIndex);
    }

    clearMessages() {
        this.errorMessage = '';
    }

    // Parent communication methods
    dispatchSuccessEvent(data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'MyABNForm',
                result: data,
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
                componentName: 'MyABNForm',
                errorMessage: error,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchSelectionEvent(selectedData) {
        const selectionEvent = new CustomEvent('abnselected', {
            detail: {
                componentName: 'MyABNForm',
                selectedResult: selectedData,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchChangeEvent() {
        const changeEvent = new CustomEvent('abnchanged', {
            detail: {
                componentName: 'MyABNForm',
                action: 'reset',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.selectedResult = null;
        this.searchResults = [];
        this.paginatedResults = [];
        this.searchTerm = '';
        this.clearMessages();
    }

    @api
    validateComponent() {
        return {
            isValid: this.selectedResult !== null,
            selectedResult: this.selectedResult,
            hasSelection: !!this.selectedResult
        };
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    setSearchTerm(term) {
        this.searchTerm = term;
        this.detectSearchType();
    }
}
