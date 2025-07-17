import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newestabnLookupTestV2Controller.searchABN';

export default class NewestAbnLookupTestV2 extends LightningElement {
    // Public API properties for parent components
    @api recordId;
    @api configSettings;
    @api initialSearchValue = '';
    @api isReadOnly = false;
    
    // Tracked properties
    @track searchValue = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedResult = null;
    @track errorMessage = '';
    @track isLoading = false;
    @track currentMode = 'find'; // 'find' or 'change'
    @track searchType = 'name'; // 'abn', 'acn', 'name'
    
    // Component state
    showError = false;
    showResults = false;
    showSelectedResult = false;
    
    connectedCallback() {
        if (this.initialSearchValue) {
            this.searchValue = this.initialSearchValue;
        }
    }
    
    // Computed properties
    get showSearchInterface() {
        return this.currentMode === 'find' && !this.showSelectedResult;
    }
    
    get showPagination() {
        return this.searchResults && this.searchResults.length > 10;
    }
    
    get findAbnButtonClass() {
        return this.currentMode === 'find' 
            ? 'slds-button slds-button_brand' 
            : 'slds-button slds-button_neutral';
    }
    
    get changeAbnButtonClass() {
        return this.currentMode === 'change' 
            ? 'slds-button slds-button_brand' 
            : 'slds-button slds-button_neutral';
    }
    
    get searchDescription() {
        if (this.currentMode === 'change') {
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
    
    get searchButtonLabel() {
        return this.currentMode === 'change' ? 'Verify' : 'Search';
    }
    
    get isSearchDisabled() {
        return this.isLoading || !this.searchValue || this.searchValue.length < 2;
    }
    
    // Event handlers
    handleFindAbnClick() {
        this.currentMode = 'find';
        this.resetComponent();
    }
    
    handleChangeAbnClick() {
        this.currentMode = 'change';
        this.resetComponent();
    }
    
    handleSearchValueChange(event) {
        this.searchValue = event.target.value;
        this.detectSearchType();
        this.clearResults();
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
            this.selectedResult = selected;
            this.showSelectedResult = true;
            this.showResults = false;
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(selected);
        }
    }
    
    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
    }
    
    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }
    
    // Public API methods
    @api
    refreshData() {
        if (this.searchValue) {
            this.performSearch();
        }
    }
    
    @api
    validateComponent() {
        return this.selectedResult !== null;
    }
    
    @api
    clearSelection() {
        this.resetComponent();
    }
    
    // Private methods
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
            this.showErrorMessage('Please enter a search value');
            return false;
        }
        
        switch (this.searchType) {
            case 'abn':
                if (!/^\d{11}$/.test(value.replace(/\s/g, ''))) {
                    this.showErrorMessage('ABN must be 11 digits');
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(value.replace(/\s/g, ''))) {
                    this.showErrorMessage('ACN must be 9 digits');
                    return false;
                }
                break;
            case 'name':
                if (value.length < 2) {
                    this.showErrorMessage('Company name must be at least 2 characters');
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    async performSearch() {
        this.isLoading = true;
        this.clearResults();
        
        try {
            const searchParams = {
                searchValue: this.searchValue.trim(),
                searchType: this.searchType
            };
            
            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
            } else {
                this.showErrorMessage(result.message || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showErrorMessage('An error occurred during search. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }
    
    processSearchResults(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) {
            this.showErrorMessage(`No matching results for ${this.searchValue}, please check the inputs and try again.`);
            return;
        }
        
        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((item, index) => ({
            id: `result_${index}`,
            abnNumber: this.extractABN(item),
            entityName: this.extractEntityName(item),
            abnStatus: this.extractABNStatus(item),
            entityType: this.extractEntityType(item),
            gstStatus: this.extractGSTStatus(item),
            businessLocation: this.extractBusinessLocation(item),
            rawData: item
        }));
        
        this.showResults = true;
        this.showError = false;
        
        // Initialize pagination
        this.initializePagination();
        
        // Dispatch results event to parent
        this.dispatchResultsEvent(this.searchResults);
    }
    
    initializePagination() {
        if (this.searchResults.length <= 10) {
            this.paginatedResults = [...this.searchResults];
        } else {
            // Let pagination component handle the data
            this.paginatedResults = this.searchResults.slice(0, 10);
        }
    }
    
    // Data extraction methods
    extractABN(data) {
        return data.abn?.identifier_value || 'N/A';
    }
    
    extractEntityName(data) {
        return data.other_trading_name?.organisation_name || data.entity_name || 'N/A';
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
        const gst = data.goods_and_services_tax;
        if (gst?.effective_from) {
            return `Registered from ${this.formatDate(gst.effective_from)}`;
        }
        return 'Not registered';
    }
    
    extractBusinessLocation(data) {
        return data.main_business_location || data.asic_number || 'N/A';
    }
    
    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return '';
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
    
    // Utility methods
    showErrorMessage(message) {
        this.errorMessage = message;
        this.showError = true;
        this.showResults = false;
    }
    
    clearResults() {
        this.showError = false;
        this.showResults = false;
        this.searchResults = [];
        this.paginatedResults = [];
    }
    
    resetComponent() {
        this.searchValue = '';
        this.selectedResult = null;
        this.showSelectedResult = false;
        this.clearResults();
    }
    
    // Parent communication events
    dispatchSelectionEvent(selectedData) {
        const selectionEvent = new CustomEvent('abnselection', {
            detail: {
                componentName: 'newestabnLookupTestV2',
                selectedResult: selectedData,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }
    
    dispatchResultsEvent(results) {
        const resultsEvent = new CustomEvent('abnresults', {
            detail: {
                componentName: 'newestabnLookupTestV2',
                results: results,
                resultCount: results.length,
                searchValue: this.searchValue,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(resultsEvent);
    }
    
    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('abnerror', {
            detail: {
                componentName: 'newestabnLookupTestV2',
                errorMessage: error.message || error,
                searchValue: this.searchValue,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }
}
