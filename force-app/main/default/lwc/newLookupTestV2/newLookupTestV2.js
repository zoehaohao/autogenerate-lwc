import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newLookupTestV2Controller.searchABN';

export default class NewLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    
    @track searchValue = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = '';
    
    // Search type constants
    ABN_TYPE = 'ABN';
    ACN_TYPE = 'ACN';
    NAME_TYPE = 'NAME';
    
    connectedCallback() {
        if (this.initialData) {
            this.searchValue = this.initialData;
            this.detectSearchType();
        }
    }
    
    get searchPlaceholder() {
        switch (this.searchType) {
            case this.ABN_TYPE:
                return 'Enter 11-digit ABN number';
            case this.ACN_TYPE:
                return 'Enter 9-digit ACN number';
            case this.NAME_TYPE:
                return 'Enter company name (minimum 2 characters)';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }
    
    get searchButtonLabel() {
        switch (this.searchType) {
            case this.ABN_TYPE:
            case this.ACN_TYPE:
                return 'Verify';
            default:
                return 'Search';
        }
    }
    
    get isSearchDisabled() {
        return this.isLoading || !this.isValidInput();
    }
    
    get showResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length > 0;
    }
    
    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults.length === 0 && this.searchValue;
    }
    
    get showPagination() {
        return this.searchResults.length > 10;
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
        const value = this.searchValue.replace(/\s/g, ''); // Remove spaces
        
        if (/^\d{11}$/.test(value)) {
            this.searchType = this.ABN_TYPE;
        } else if (/^\d{9}$/.test(value)) {
            this.searchType = this.ACN_TYPE;
        } else if (value.length >= 2) {
            this.searchType = this.NAME_TYPE;
        } else {
            this.searchType = '';
        }
    }
    
    isValidInput() {
        const value = this.searchValue.trim();
        
        switch (this.searchType) {
            case this.ABN_TYPE:
                return /^\d{11}$/.test(value.replace(/\s/g, ''));
            case this.ACN_TYPE:
                return /^\d{9}$/.test(value.replace(/\s/g, ''));
            case this.NAME_TYPE:
                return value.length >= 2;
            default:
                return false;
        }
    }
    
    handleSearch() {
        if (!this.isValidInput()) {
            this.errorMessage = 'Please enter valid search criteria';
            return;
        }
        
        this.isLoading = true;
        this.errorMessage = '';
        this.clearResults();
        
        const searchParams = {
            searchValue: this.searchValue.trim(),
            searchType: this.searchType
        };
        
        searchABN(searchParams)
            .then(result => {
                if (result.success) {
                    this.processSearchResults(result.data);
                    this.dispatchSuccessEvent(result.data);
                } else {
                    this.errorMessage = result.message || 'Search failed. Please try again.';
                    this.dispatchErrorEvent(result.message);
                }
            })
            .catch(error => {
                console.error('Search error:', error);
                this.errorMessage = 'An error occurred during search. Please try again.';
                this.dispatchErrorEvent(error.body?.message || error.message);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    processSearchResults(data) {
        if (data && Array.isArray(data)) {
            this.searchResults = data.map((item, index) => ({
                id: `result-${index}`,
                abnNumber: item.abnNumber || 'N/A',
                entityName: item.entityName || 'N/A',
                abnStatus: item.abnStatus || 'N/A',
                entityType: item.entityType || 'N/A',
                gstStatus: item.gstStatus || 'N/A',
                businessLocation: item.businessLocation || 'N/A',
                rawData: item
            }));
            
            // Initialize pagination with first 10 results
            this.paginatedResults = this.searchResults.slice(0, 10);
        } else {
            this.searchResults = [];
            this.paginatedResults = [];
        }
    }
    
    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
    }
    
    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }
    
    handleSelect(event) {
        const recordId = event.target.dataset.recordId;
        const selectedRecord = this.searchResults.find(record => record.id === recordId);
        
        if (selectedRecord) {
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('abnselected', {
                detail: {
                    selectedRecord: selectedRecord,
                    abnNumber: selectedRecord.abnNumber,
                    entityName: selectedRecord.entityName,
                    rawData: selectedRecord.rawData
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);
        }
    }
    
    clearResults() {
        this.searchResults = [];
        this.paginatedResults = [];
        this.errorMessage = '';
    }
    
    dispatchSuccessEvent(data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'newLookupTestV2',
                result: data,
                message: 'Search completed successfully',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }
    
    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'newLookupTestV2',
                errorMessage: errorMessage,
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
        if (this.searchValue) {
            this.handleSearch();
        }
    }
    
    @api
    validateComponent() {
        return this.isValidInput();
    }
    
    @api
    clearSearch() {
        this.searchValue = '';
        this.searchType = '';
        this.clearResults();
    }
    
    @api
    setSearchValue(value) {
        this.searchValue = value;
        this.detectSearchType();
    }
}
