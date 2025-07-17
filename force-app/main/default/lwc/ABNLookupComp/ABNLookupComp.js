import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/ABNLookupCompController.searchABN';

export default class ABNLookupComp extends LightningElement {
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
    @track currentView = 'search'; // 'search', 'results', 'selected'
    @track searchType = 'name'; // 'abn', 'acn', 'name'

    // Computed properties
    get actionButtonLabel() {
        return this.currentView === 'selected' ? 'Change ABN' : 'Find ABN';
    }

    get searchButtonLabel() {
        return this.searchType === 'abn' ? 'Verify' : 'Search';
    }

    get descriptionText() {
        if (this.currentView === 'selected') {
            return '';
        }
        if (this.searchType === 'abn') {
            return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
        }
        return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
    }

    get searchPlaceholder() {
        switch (this.searchType) {
            case 'abn':
                return 'Enter 11-digit ABN';
            case 'acn':
                return 'Enter 9-digit ACN';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.isValidSearchTerm;
    }

    get isValidSearchTerm() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            return false;
        }

        const trimmedTerm = this.searchTerm.trim();
        
        // ABN validation (11 digits)
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = 'abn';
            return true;
        }
        
        // ACN validation (9 digits)
        if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = 'acn';
            return true;
        }
        
        // Company name validation (minimum 2 characters)
        if (trimmedTerm.length >= 2) {
            this.searchType = 'name';
            return true;
        }
        
        return false;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && this.currentView === 'results';
    }

    get showNoResults() {
        return this.currentView === 'results' && 
               this.searchResults && 
               this.searchResults.length === 0 && 
               !this.isLoading && 
               !this.errorMessage;
    }

    get showPagination() {
        return this.hasResults && this.searchResults.length > 10;
    }

    // Event handlers
    handleActionButton() {
        if (this.currentView === 'selected') {
            this.handleChangeABN();
        } else {
            this.currentView = 'search';
        }
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    handleSearch() {
        if (!this.isValidSearchTerm) {
            this.errorMessage = 'Please enter a valid search term';
            return;
        }

        this.performSearch();
    }

    handleSelectResult(event) {
        const selectedId = event.target.dataset.id;
        const selected = this.searchResults.find(result => result.id === selectedId);
        
        if (selected) {
            this.selectedResult = { ...selected };
            this.currentView = 'selected';
            
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('abnselected', {
                detail: {
                    selectedResult: this.selectedResult,
                    searchTerm: this.searchTerm,
                    searchType: this.searchType
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);
        }
    }

    handleChangeABN() {
        this.selectedResult = null;
        this.currentView = 'search';
        this.searchResults = [];
        this.paginatedResults = [];
        this.searchTerm = '';
        this.errorMessage = '';
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // API Methods
    async performSearch() {
        this.isLoading = true;
        this.errorMessage = '';
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
                this.currentView = 'results';
                
                // Initialize pagination data
                if (this.searchResults.length > 0) {
                    this.paginatedResults = this.searchResults.slice(0, 10);
                }

                // Dispatch search event to parent
                const searchEvent = new CustomEvent('searchcompleted', {
                    detail: {
                        results: this.searchResults,
                        searchTerm: this.searchTerm,
                        searchType: this.searchType,
                        resultCount: this.searchResults.length
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(searchEvent);
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.currentView = 'search';
                
                // Dispatch error event to parent
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.currentView = 'search';
            this.dispatchErrorEvent(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data) return [];
        
        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map((item, index) => {
            const abn = item.abn || {};
            const entityStatus = item.entity_status || {};
            const entityType = item.entity_type || {};
            const gst = item.goods_and_services_tax || {};
            const otherTradingName = item.other_trading_name || {};
            
            return {
                id: `result_${index}_${abn.identifier_value || Date.now()}`,
                abnNumber: abn.identifier_value || 'N/A',
                entityName: otherTradingName.organisation_name || 'N/A',
                abnStatus: entityStatus.entity_status_code ? 
                    `${entityStatus.entity_status_code} from ${this.formatDate(entityStatus.effective_from)}` : 'N/A',
                entityType: entityType.entity_description || 'N/A',
                gstStatus: gst.effective_from ? 
                    `Registered from ${this.formatDate(gst.effective_from)}` : 'Not registered',
                businessLocation: item.asic_number || 'N/A',
                rawData: item
            };
        });
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

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'ABNLookupComp',
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

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm && this.isValidSearchTerm) {
            this.performSearch();
        }
    }

    @api
    validateComponent() {
        return {
            isValid: this.selectedResult !== null,
            selectedResult: this.selectedResult,
            errorMessage: this.selectedResult ? '' : 'Please select an ABN'
        };
    }

    @api
    clearSelection() {
        this.handleChangeABN();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }
}
