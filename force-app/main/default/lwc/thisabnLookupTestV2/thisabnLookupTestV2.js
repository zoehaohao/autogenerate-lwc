import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/thisabnLookupTestV2Controller.searchABN';

export default class ThisabnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track allResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';
    @track hasSearched = false;

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
        return !this.isLoading && !this.errorMessage && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.hasSearched && this.searchResults.length === 0;
    }

    get showPagination() {
        return this.allResults.length > 10;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
    }

    handleSearch() {
        if (!this.isValidSearchTerm) {
            this.errorMessage = 'Please enter a valid search term';
            return;
        }

        this.performSearch();
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.allResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = selected;
            this.dispatchSelectionEvent(selected);
        }
    }

    handleChangeAbn() {
        this.selectedResult = null;
        this.clearResults();
    }

    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
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

    async performSearch() {
        this.isLoading = true;
        this.clearMessages();
        this.hasSearched = true;

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });

            if (result.success) {
                this.processSearchResults(result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An error occurred while searching. Please try again.';
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
            id: `result-${index}`,
            abnNumber: this.extractABNNumber(item),
            entityName: this.extractEntityName(item),
            abnStatus: this.extractABNStatus(item),
            entityType: this.extractEntityType(item),
            gstStatus: this.extractGSTStatus(item),
            businessLocation: this.extractBusinessLocation(item),
            rawData: item
        }));

        // Set initial paginated results
        this.searchResults = this.allResults.slice(0, 10);
        
        // Update pagination component if present
        this.updatePaginationComponent();
    }

    extractABNNumber(data) {
        return data.abn?.identifier_value || 'N/A';
    }

    extractEntityName(data) {
        return data.other_trading_name?.organisation_name || 'N/A';
    }

    extractABNStatus(data) {
        const status = data.entity_status?.entity_status_code || 'Unknown';
        const effectiveFrom = data.entity_status?.effective_from;
        return effectiveFrom ? `${status} from ${this.formatDate(effectiveFrom)}` : status;
    }

    extractEntityType(data) {
        return data.entity_type?.entity_description || 'N/A';
    }

    extractGSTStatus(data) {
        const effectiveFrom = data.goods_and_services_tax?.effective_from;
        return effectiveFrom ? `Registered from ${this.formatDate(effectiveFrom)}` : 'Not registered';
    }

    extractBusinessLocation(data) {
        return data.asic_number || 'N/A';
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

    updatePaginationComponent() {
        const paginationComponent = this.template.querySelector('c-acds-pagination');
        if (paginationComponent) {
            paginationComponent.data = this.allResults;
            paginationComponent.totalRecord = this.allResults.length;
        }
    }

    clearMessages() {
        this.errorMessage = '';
    }

    clearResults() {
        this.searchResults = [];
        this.allResults = [];
        this.hasSearched = false;
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('abnselected', {
            detail: {
                componentName: 'thisabnLookupTestV2',
                selectedResult: selectedResult,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    // Public API methods
    @api
    refreshData() {
        if (this.searchTerm && this.isValidSearchTerm) {
            this.performSearch();
        }
    }

    @api
    validateComponent() {
        return this.selectedResult !== null;
    }

    @api
    clearSelection() {
        this.selectedResult = null;
        this.clearResults();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }
}
