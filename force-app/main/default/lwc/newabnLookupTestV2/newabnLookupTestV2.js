import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newabnLookupTestV2Controller.searchABN';

export default class NewabnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchValue = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';
    @track showNoResults = false;

    // Pagination properties
    currentPage = 1;
    pageSize = 10;
    totalPages = 0;

    connectedCallback() {
        if (this.initialData) {
            this.searchValue = this.initialData.searchTerm || '';
        }
    }

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
        return this.isLoading || !this.searchValue || this.searchValue.length < 2;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.selectedResult;
    }

    get showPagination() {
        return this.hasResults && this.searchResults.length > this.pageSize;
    }

    handleSearchChange(event) {
        this.searchValue = event.target.value;
        this.detectSearchType();
        this.clearResults();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    detectSearchType() {
        const value = this.searchValue.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(value)) {
            this.searchType = 'abn';
        } else if (/^\d{9}$/.test(value)) {
            this.searchType = 'acn';
        } else {
            this.searchType = 'name';
        }
    }

    validateInput() {
        const value = this.searchValue.trim();
        
        if (!value) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }

        if (this.searchType === 'abn' && !/^\d{11}$/.test(value.replace(/\s/g, ''))) {
            this.errorMessage = 'ABN must be exactly 11 digits';
            return false;
        }

        if (this.searchType === 'acn' && !/^\d{9}$/.test(value.replace(/\s/g, ''))) {
            this.errorMessage = 'ACN must be exactly 9 digits';
            return false;
        }

        if (this.searchType === 'name' && value.length < 2) {
            this.errorMessage = 'Company name must be at least 2 characters';
            return false;
        }

        return true;
    }

    async handleSearch() {
        if (!this.validateInput()) {
            return;
        }

        this.isLoading = true;
        this.clearResults();

        try {
            const searchParams = {
                searchTerm: this.searchValue.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSearchEvent('success', result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.dispatchSearchEvent('error', { message: this.errorMessage });
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchSearchEvent('error', { message: this.errorMessage });
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) {
            this.showNoResults = true;
            this.searchResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((item, index) => ({
            id: `result-${index}`,
            abn: this.extractValue(item, 'abn.identifier_value') || 'N/A',
            entityName: this.extractValue(item, 'other_trading_name.organisation_name') || 'N/A',
            abnStatus: this.formatAbnStatus(item),
            entityType: this.extractValue(item, 'entity_type.entity_description') || 'N/A',
            gstStatus: this.formatGstStatus(item),
            businessLocation: this.extractValue(item, 'asic_number') || 'N/A',
            rawData: item
        }));

        this.totalPages = Math.ceil(this.searchResults.length / this.pageSize);
        this.updatePaginatedResults();
    }

    extractValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    formatAbnStatus(item) {
        const status = this.extractValue(item, 'entity_status.entity_status_code');
        const effectiveFrom = this.extractValue(item, 'entity_status.effective_from');
        
        if (status && effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status || 'N/A';
    }

    formatGstStatus(item) {
        const effectiveFrom = this.extractValue(item, 'goods_and_services_tax.effective_from');
        
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

    handleSelect(event) {
        const recordId = event.target.dataset.recordId;
        const selected = this.searchResults.find(result => result.id === recordId);
        
        if (selected) {
            this.selectedResult = selected;
            this.dispatchSelectionEvent(selected);
        }
    }

    handleChangeAbn() {
        this.selectedResult = null;
        this.clearResults();
        this.searchValue = '';
    }

    clearResults() {
        this.errorMessage = '';
        this.showNoResults = false;
        this.searchResults = [];
        this.paginatedResults = [];
        this.currentPage = 1;
    }

    dispatchSearchEvent(type, data) {
        const searchEvent = new CustomEvent('abnlookup', {
            detail: {
                componentName: 'newabnLookupTestV2',
                type: type,
                searchTerm: this.searchValue,
                searchType: this.searchType,
                data: data,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(searchEvent);
    }

    dispatchSelectionEvent(selectedData) {
        const selectionEvent = new CustomEvent('abnselection', {
            detail: {
                componentName: 'newabnLookupTestV2',
                selectedResult: selectedData,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    @api
    refreshData() {
        this.clearResults();
        if (this.searchValue) {
            this.handleSearch();
        }
    }

    @api
    validateComponent() {
        return this.validateInput();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    clearSelection() {
        this.selectedResult = null;
        this.clearResults();
    }
}
