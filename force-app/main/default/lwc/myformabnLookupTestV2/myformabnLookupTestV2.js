import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/myformabnLookupTestV2Controller.searchABN';

export default class MyformabnLookupTestV2 extends LightningElement {
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
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.selectedResult;
    }

    get showNoResults() {
        return !this.isLoading && !this.hasResults && this.searchTerm && !this.selectedResult && !this.errorMessage;
    }

    get showPagination() {
        return this.allResults && this.allResults.length > this.pageSize;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearResults();
    }

    handleSearch() {
        if (this.validateInput()) {
            this.performSearch();
        }
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
        this.searchTerm = '';
    }

    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
        this.currentPage = event.detail.currentPage;
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize;
    }

    // Search type detection
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

    // Input validation
    validateInput() {
        this.errorMessage = '';
        
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }

        const cleanTerm = this.searchTerm.replace(/\s/g, '');

        switch (this.searchType) {
            case 'abn':
                if (!/^\d{11}$/.test(cleanTerm)) {
                    this.errorMessage = 'ABN must be exactly 11 digits';
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(cleanTerm)) {
                    this.errorMessage = 'ACN must be exactly 9 digits';
                    return false;
                }
                break;
            case 'name':
                if (this.searchTerm.trim().length < 2) {
                    this.errorMessage = 'Company name must be at least 2 characters';
                    return false;
                }
                break;
        }

        return true;
    }

    // Perform search
    async performSearch() {
        this.isLoading = true;
        this.errorMessage = '';
        this.clearResults();

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

    // Process search results
    processSearchResults(data) {
        if (!data) {
            this.errorMessage = 'No results found';
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.allResults = results.map((item, index) => ({
            id: `result-${index}`,
            abnNumber: this.formatABN(item.abn?.identifier_value),
            entityName: this.getEntityName(item),
            abnStatus: this.getABNStatus(item),
            entityType: item.entity_type?.entity_description || 'N/A',
            gstStatus: this.getGSTStatus(item),
            businessLocation: item.main_business_location || 'N/A',
            rawData: item
        }));

        // Set initial paginated results
        this.searchResults = this.allResults.slice(0, this.pageSize);

        if (this.allResults.length === 0) {
            this.errorMessage = `No matching results for ${this.searchTerm}, please check the inputs and try again.`;
        }
    }

    // Helper methods
    formatABN(abn) {
        if (!abn) return 'N/A';
        return abn.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    }

    getEntityName(item) {
        return item.other_trading_name?.organisation_name || 
               item.entity_name?.organisation_name || 
               'N/A';
    }

    getABNStatus(item) {
        const status = item.entity_status?.entity_status_code || 'Unknown';
        const effectiveFrom = item.entity_status?.effective_from;
        
        if (effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status;
    }

    getGSTStatus(item) {
        const gst = item.goods_and_services_tax;
        if (!gst) return 'Not registered';
        
        const effectiveFrom = gst.effective_from;
        if (effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `Registered from ${this.formatDate(effectiveFrom)}`;
        }
        return 'Registered';
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

    // Parent communication methods
    dispatchSelectionEvent(selectedData) {
        const selectionEvent = new CustomEvent('abnselected', {
            detail: {
                componentName: 'myformabnLookupTestV2',
                selectedABN: selectedData,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'myformabnLookupTestV2',
                errorMessage: error.message || error,
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
        this.clearResults();
        this.selectedResult = null;
        this.searchTerm = '';
    }

    @api
    validateComponent() {
        return {
            isValid: this.selectedResult !== null,
            selectedData: this.selectedResult,
            hasSelection: this.selectedResult !== null
        };
    }

    @api
    getSelectedABN() {
        return this.selectedResult;
    }

    @api
    setSearchTerm(term) {
        this.searchTerm = term;
        this.detectSearchType();
    }
}
