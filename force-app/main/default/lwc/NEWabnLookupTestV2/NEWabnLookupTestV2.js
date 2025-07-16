import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/NEWabnLookupTestV2Controller.searchABN';

export default class NEWabnLookupTestV2 extends LightningElement {
    // Public API properties for parent components
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentSearchType = 'initial';
    @track currentPage = 1;
    @track pageSize = 10;

    // Component state
    showSearchSection = false;
    showSelectedResult = false;

    // Search type constants
    SEARCH_TYPES = {
        ABN: 'abn',
        ACN: 'acn',
        COMPANY_NAME: 'companyName',
        INITIAL: 'initial'
    };

    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
            this.detectSearchType();
        }
    }

    // Computed properties
    get actionButtonLabel() {
        return this.currentSearchType === 'initial' ? 'Find ABN' : 'Change ABN';
    }

    get searchButtonLabel() {
        return this.currentSearchType === 'abn' ? 'Verify' : 'Search';
    }

    get searchPlaceholder() {
        switch (this.currentSearchType) {
            case 'abn':
                return 'Enter 11-digit ABN number';
            case 'acn':
                return 'Enter 9-digit ACN number';
            case 'companyName':
                return 'Search by Business name, ABN or ACN';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchInstructions() {
        switch (this.currentSearchType) {
            case 'abn':
                return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
            default:
                return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
        }
    }

    get showError() {
        return this.errorMessage && !this.isLoading;
    }

    get showResults() {
        return this.searchResults.length > 0 && !this.isLoading && !this.showError;
    }

    get showPagination() {
        return this.searchResults.length > this.pageSize;
    }

    get isSearchDisabled() {
        return this.isLoading || !this.isSearchTermValid;
    }

    get isSearchTermValid() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            return false;
        }

        const trimmedTerm = this.searchTerm.trim();
        const searchType = this.detectSearchTypeFromInput(trimmedTerm);

        switch (searchType) {
            case 'abn':
                return /^\d{11}$/.test(trimmedTerm.replace(/\s/g, ''));
            case 'acn':
                return /^\d{9}$/.test(trimmedTerm.replace(/\s/g, ''));
            case 'companyName':
                return trimmedTerm.length >= 2;
            default:
                return false;
        }
    }

    // Event handlers
    handleActionButton() {
        if (this.currentSearchType === 'initial') {
            this.showSearchSection = true;
            this.currentSearchType = 'companyName';
        } else {
            this.resetComponent();
        }
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearError();
    }

    handleSearch() {
        if (!this.isSearchTermValid) {
            this.showErrorMessage('Please enter a valid search term.');
            return;
        }

        this.performSearch();
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.searchResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = selected;
            this.showSelectedResult = true;
            this.showSearchSection = false;
            this.currentSearchType = 'selected';

            // Notify parent component
            this.dispatchSelectionEvent(selected);
        }
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
        this.currentPage = event.detail.currentPage;
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize;
    }

    // Search functionality
    async performSearch() {
        this.isLoading = true;
        this.clearError();
        this.searchResults = [];

        try {
            const searchType = this.detectSearchTypeFromInput(this.searchTerm.trim());
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: searchType
            };

            const result = await searchABN(searchParams);

            if (result.success) {
                this.processSearchResults(result.data);
            } else {
                this.showErrorMessage(result.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showErrorMessage('An error occurred while searching. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) {
            this.showNoResultsError();
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((item, index) => {
            return {
                id: `result_${index}`,
                abnNumber: this.extractValue(item, 'abn.identifier_value') || 'N/A',
                entityName: this.extractValue(item, 'other_trading_name.organisation_name') || 
                          this.extractValue(item, 'entity_name') || 'N/A',
                abnStatus: this.formatABNStatus(item),
                entityType: this.extractValue(item, 'entity_type.entity_description') || 'N/A',
                gstStatus: this.formatGSTStatus(item),
                mainBusinessLocation: this.extractValue(item, 'main_business_location') || 'N/A',
                rawData: item
            };
        });

        // Initialize pagination
        this.initializePagination();
    }

    // Helper methods
    detectSearchType() {
        this.currentSearchType = this.detectSearchTypeFromInput(this.searchTerm);
    }

    detectSearchTypeFromInput(input) {
        if (!input) return 'companyName';
        
        const cleanInput = input.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(cleanInput)) {
            return 'abn';
        } else if (/^\d{9}$/.test(cleanInput)) {
            return 'acn';
        } else {
            return 'companyName';
        }
    }

    extractValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    formatABNStatus(item) {
        const status = this.extractValue(item, 'entity_status.entity_status_code');
        const effectiveFrom = this.extractValue(item, 'entity_status.effective_from');
        
        if (status && effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status || 'N/A';
    }

    formatGSTStatus(item) {
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

    initializePagination() {
        if (this.searchResults.length <= this.pageSize) {
            this.paginatedResults = [...this.searchResults];
        } else {
            this.paginatedResults = this.searchResults.slice(0, this.pageSize);
        }
    }

    showNoResultsError() {
        const searchType = this.detectSearchTypeFromInput(this.searchTerm);
        let message = `No matching results for ${this.searchTerm}`;
        
        if (searchType === 'abn') {
            message += ', please check the inputs and try again.';
        } else {
            message += '. Please try a different search term.';
        }
        
        this.showErrorMessage(message);
    }

    showErrorMessage(message) {
        this.errorMessage = message;
        this.searchResults = [];
        this.paginatedResults = [];
    }

    clearError() {
        this.errorMessage = '';
    }

    resetComponent() {
        this.searchTerm = '';
        this.searchResults = [];
        this.paginatedResults = [];
        this.selectedResult = null;
        this.errorMessage = '';
        this.showSearchSection = true;
        this.showSelectedResult = false;
        this.currentSearchType = 'companyName';
        this.currentPage = 1;
    }

    // Parent component communication
    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('abnselection', {
            detail: {
                componentName: 'NEWabnLookupTestV2',
                selectedResult: selectedResult,
                abnNumber: selectedResult.abnNumber,
                entityName: selectedResult.entityName,
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
        if (this.searchTerm && this.isSearchTermValid) {
            this.performSearch();
        }
    }

    @api
    validateComponent() {
        return {
            isValid: this.selectedResult !== null,
            selectedResult: this.selectedResult,
            errorMessage: this.selectedResult ? '' : 'Please select an ABN result'
        };
    }

    @api
    clearSelection() {
        this.resetComponent();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }
}
