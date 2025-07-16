import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/NEWabnLookupTestV2Controller.searchABN';

export default class NEWabnLookupTestV2 extends LightningElement {
    // Public API properties for parent component configuration
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    // Tracked properties for component state
    @track searchValue = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedResult = null;
    @track errorMessage = '';
    @track isLoading = false;
    @track currentSearchType = 'name';
    @track showSearchSection = true;
    @track showSelectedResult = false;

    // Search type constants
    searchTypes = {
        ABN: 'abn',
        ACN: 'acn',
        NAME: 'name'
    };

    // Component lifecycle
    connectedCallback() {
        this.initializeComponent();
    }

    // Initialize component based on configuration
    initializeComponent() {
        if (this.initialData) {
            this.selectedResult = this.initialData;
            this.showSelectedResult = true;
            this.showSearchSection = false;
        }
    }

    // Computed properties
    get actionButtonLabel() {
        return this.showSelectedResult ? 'Change ABN' : 'Find ABN';
    }

    get searchInstructions() {
        if (this.showSelectedResult) {
            return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
        }
        return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
    }

    get searchPlaceholder() {
        switch (this.currentSearchType) {
            case this.searchTypes.ABN:
                return 'Enter 11-digit ABN';
            case this.searchTypes.ACN:
                return 'Enter 9-digit ACN';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchButtonLabel() {
        return this.currentSearchType === this.searchTypes.NAME ? 'Search' : 'Verify';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.isValidInput();
    }

    get showError() {
        return this.errorMessage && this.errorMessage.length > 0;
    }

    get showResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.showSelectedResult;
    }

    get showPagination() {
        return this.searchResults && this.searchResults.length > 10;
    }

    // Event handlers
    handleActionButton() {
        if (this.showSelectedResult) {
            this.handleChangeAbn();
        } else {
            // Toggle search section visibility
            this.showSearchSection = !this.showSearchSection;
        }
    }

    handleSearchInput(event) {
        this.searchValue = event.target.value;
        this.detectSearchType();
        this.clearError();
    }

    handleSearch() {
        if (!this.isValidInput()) {
            this.showValidationError();
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
            this.searchResults = [];
            this.paginatedResults = [];
            
            // Notify parent component
            this.dispatchSelectionEvent(selected);
        }
    }

    handleChangeAbn() {
        this.selectedResult = null;
        this.showSelectedResult = false;
        this.showSearchSection = true;
        this.clearSearchData();
        
        // Notify parent component
        this.dispatchChangeEvent();
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Search functionality
    detectSearchType() {
        const value = this.searchValue.trim();
        
        if (/^\d{11}$/.test(value)) {
            this.currentSearchType = this.searchTypes.ABN;
        } else if (/^\d{9}$/.test(value)) {
            this.currentSearchType = this.searchTypes.ACN;
        } else {
            this.currentSearchType = this.searchTypes.NAME;
        }
    }

    isValidInput() {
        const value = this.searchValue.trim();
        
        switch (this.currentSearchType) {
            case this.searchTypes.ABN:
                return /^\d{11}$/.test(value);
            case this.searchTypes.ACN:
                return /^\d{9}$/.test(value);
            case this.searchTypes.NAME:
                return value.length >= 2;
            default:
                return false;
        }
    }

    showValidationError() {
        switch (this.currentSearchType) {
            case this.searchTypes.ABN:
                this.errorMessage = 'Please enter a valid 11-digit ABN number.';
                break;
            case this.searchTypes.ACN:
                this.errorMessage = 'Please enter a valid 9-digit ACN number.';
                break;
            case this.searchTypes.NAME:
                this.errorMessage = 'Please enter at least 2 characters for company name search.';
                break;
        }
    }

    async performSearch() {
        this.isLoading = true;
        this.clearError();
        
        try {
            const searchParams = {
                searchValue: this.searchValue.trim(),
                searchType: this.currentSearchType
            };
            
            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
            } else {
                this.handleSearchError(result.message);
            }
        } catch (error) {
            this.handleSearchError('An unexpected error occurred. Please try again.');
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (data && data.length > 0) {
            this.searchResults = data.map((item, index) => ({
                id: `result_${index}`,
                abnNumber: item.abnNumber || 'N/A',
                entityName: item.entityName || 'N/A',
                abnStatus: item.abnStatus || 'N/A',
                entityType: item.entityType || 'N/A',
                gstStatus: item.gstStatus || 'N/A',
                businessLocation: item.businessLocation || 'N/A'
            }));
            
            // Initialize pagination with first page
            this.paginatedResults = this.searchResults.slice(0, 10);
            
            // Dispatch success event
            this.dispatchSearchEvent('success', {
                searchType: this.currentSearchType,
                searchValue: this.searchValue,
                resultCount: this.searchResults.length
            });
        } else {
            this.handleNoResults();
        }
    }

    handleSearchError(message) {
        this.errorMessage = message;
        this.searchResults = [];
        this.paginatedResults = [];
        
        // Dispatch error event
        this.dispatchSearchEvent('error', {
            searchType: this.currentSearchType,
            searchValue: this.searchValue,
            errorMessage: message
        });
    }

    handleNoResults() {
        this.errorMessage = `No matching results for ${this.searchValue}, please check the inputs and try again.`;
        this.searchResults = [];
        this.paginatedResults = [];
    }

    // Utility methods
    clearError() {
        this.errorMessage = '';
    }

    clearSearchData() {
        this.searchValue = '';
        this.searchResults = [];
        this.paginatedResults = [];
        this.clearError();
    }

    // Parent communication methods
    dispatchSelectionEvent(selectedData) {
        const selectionEvent = new CustomEvent('abnselection', {
            detail: {
                componentName: 'NEWabnLookupTestV2',
                selectedResult: selectedData,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchChangeEvent() {
        const changeEvent = new CustomEvent('abnchange', {
            detail: {
                componentName: 'NEWabnLookupTestV2',
                action: 'change_abn',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    dispatchSearchEvent(type, data) {
        const searchEvent = new CustomEvent('abnsearch', {
            detail: {
                componentName: 'NEWabnLookupTestV2',
                type: type,
                data: data,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(searchEvent);
    }

    // Public API methods for parent component
    @api
    refreshData() {
        this.clearSearchData();
        this.initializeComponent();
    }

    @api
    validateComponent() {
        return this.selectedResult !== null;
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    setSelectedResult(result) {
        this.selectedResult = result;
        this.showSelectedResult = true;
        this.showSearchSection = false;
    }
}
