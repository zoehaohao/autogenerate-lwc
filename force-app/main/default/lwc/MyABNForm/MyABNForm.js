import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/MyABNFormController.searchABN';

export default class MyABNForm extends LightningElement {
    // Public API properties for parent components
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track allResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentView = 'search'; // 'search', 'results', 'selected'
    @track searchType = 'name'; // 'abn', 'acn', 'name'

    // Component state
    get showSearchSection() {
        return this.currentView === 'search';
    }

    get showResults() {
        return this.currentView === 'results' && this.searchResults.length > 0;
    }

    get showSelectedResult() {
        return this.currentView === 'selected' && this.selectedResult;
    }

    get showError() {
        return this.errorMessage && this.errorMessage.length > 0;
    }

    get showPagination() {
        return this.allResults && this.allResults.length > 10;
    }

    get actionButtonLabel() {
        return this.currentView === 'selected' ? 'Change ABN' : 'Find ABN';
    }

    get searchButtonLabel() {
        return this.searchType === 'abn' ? 'Verify' : 'Search';
    }

    get searchPlaceholder() {
        switch(this.searchType) {
            case 'abn':
                return 'Enter 11-digit ABN';
            case 'acn':
                return 'Enter 9-digit ACN';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    // Event handlers
    handleActionButtonClick() {
        if (this.currentView === 'selected') {
            this.handleChangeABN();
        } else {
            this.currentView = 'search';
        }
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearError();
    }

    handleSearch() {
        if (!this.validateInput()) {
            return;
        }

        this.performSearch();
    }

    handleSelectResult(event) {
        const recordId = event.currentTarget.dataset.recordId;
        const selected = this.searchResults.find(result => result.id === recordId);
        
        if (selected) {
            this.selectedResult = selected;
            this.currentView = 'selected';
            
            // Notify parent component
            this.dispatchSelectionEvent(selected);
        }
    }

    handleChangeABN() {
        this.currentView = 'search';
        this.selectedResult = null;
        this.searchResults = [];
        this.allResults = [];
        this.searchTerm = '';
        this.clearError();
    }

    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Search functionality
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

    validateInput() {
        const term = this.searchTerm.trim();
        
        if (!term) {
            this.setError('Please enter a search term');
            return false;
        }

        switch(this.searchType) {
            case 'abn':
                if (!/^\d{11}$/.test(term.replace(/\s/g, ''))) {
                    this.setError('ABN must be 11 digits');
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(term.replace(/\s/g, ''))) {
                    this.setError('ACN must be 9 digits');
                    return false;
                }
                break;
            case 'name':
                if (term.length < 2) {
                    this.setError('Company name must be at least 2 characters');
                    return false;
                }
                break;
        }

        return true;
    }

    async performSearch() {
        this.isLoading = true;
        this.clearError();

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
            } else {
                this.setError(result.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.setError('An error occurred while searching. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    processSearchResults(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) {
            this.setError(`No matching results for ${this.searchTerm}, please check the inputs and try again.`);
            this.searchResults = [];
            this.allResults = [];
            return;
        }

        // Convert single result to array for consistent processing
        const results = Array.isArray(data) ? data : [data];
        
        // Transform results for display
        this.allResults = results.map((item, index) => this.transformResult(item, index));
        this.searchResults = this.allResults.slice(0, 10); // Show first 10 results
        this.currentView = 'results';

        // Notify parent component
        this.dispatchSearchEvent(this.allResults);
    }

    transformResult(apiResult, index) {
        return {
            id: `result_${index}_${Date.now()}`,
            abnNumber: this.extractABNNumber(apiResult),
            entityName: this.extractEntityName(apiResult),
            abnStatus: this.extractABNStatus(apiResult),
            entityType: this.extractEntityType(apiResult),
            gstStatus: this.extractGSTStatus(apiResult),
            businessLocation: this.extractBusinessLocation(apiResult),
            rawData: apiResult
        };
    }

    // Data extraction helpers
    extractABNNumber(data) {
        return data?.abn?.identifier_value || 'N/A';
    }

    extractEntityName(data) {
        return data?.other_trading_name?.organisation_name || 'N/A';
    }

    extractABNStatus(data) {
        const status = data?.entity_status?.entity_status_code || 'Unknown';
        const effectiveFrom = data?.entity_status?.effective_from;
        return effectiveFrom && effectiveFrom !== '0001-01-01' 
            ? `${status} from ${this.formatDate(effectiveFrom)}`
            : status;
    }

    extractEntityType(data) {
        return data?.entity_type?.entity_description || 'N/A';
    }

    extractGSTStatus(data) {
        const effectiveFrom = data?.goods_and_services_tax?.effective_from;
        return effectiveFrom && effectiveFrom !== '0001-01-01'
            ? `Registered from ${this.formatDate(effectiveFrom)}`
            : 'Not registered';
    }

    extractBusinessLocation(data) {
        return data?.business_location || 'N/A';
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

    // Error handling
    setError(message) {
        this.errorMessage = message;
    }

    clearError() {
        this.errorMessage = '';
    }

    // Parent component communication
    dispatchSearchEvent(results) {
        const searchEvent = new CustomEvent('search', {
            detail: {
                componentName: 'MyABNForm',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                results: results,
                resultCount: results.length,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(searchEvent);
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('selection', {
            detail: {
                componentName: 'MyABNForm',
                selectedResult: selectedResult,
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
                componentName: 'MyABNForm',
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
        if (this.searchTerm) {
            this.performSearch();
        }
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
    clearSelection() {
        this.handleChangeABN();
    }
}
