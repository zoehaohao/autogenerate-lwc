import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchABN from '@salesforce/apex/NEWabnLookupTestV2Controller.searchABN';

export default class NEWabnLookupTestV2 extends LightningElement {
    // Public API properties for parent components
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;
    @api showPaginationThreshold = 10;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track allResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name'; // 'abn', 'acn', 'name'
    @track hasSearched = false;

    // Component lifecycle
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
            this.detectSearchType();
        }
    }

    // Getters for computed properties
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
        switch (this.searchType) {
            case 'abn':
            case 'acn':
                return 'Verify';
            default:
                return 'Search';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2 || this.isReadOnly;
    }

    get hasResults() {
        return !this.isLoading && this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && this.hasSearched && (!this.searchResults || this.searchResults.length === 0) && !this.errorMessage;
    }

    get showPagination() {
        return this.allResults && this.allResults.length > this.showPaginationThreshold;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13 && !this.isSearchDisabled) { // Enter key
            this.handleSearch();
        }
    }

    handleSearch() {
        if (this.isSearchDisabled) {
            return;
        }

        if (!this.validateInput()) {
            return;
        }

        this.performSearch();
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.allResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('resultselected', {
                detail: {
                    selectedResult: selectedResult,
                    searchTerm: this.searchTerm,
                    searchType: this.searchType,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);

            // Show success toast
            this.showToast('Success', `Selected: ${selectedResult.entityName}`, 'success');
        }
    }

    handlePaginationDataChange(event) {
        this.searchResults = event.detail.paginatedData;
        
        // Dispatch pagination event to parent
        const paginationEvent = new CustomEvent('paginationchange', {
            detail: {
                paginatedData: this.searchResults,
                currentPage: event.detail.currentPage,
                pageSize: event.detail.pageSize,
                totalPages: event.detail.totalPages
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(paginationEvent);
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Private methods
    detectSearchType() {
        const term = this.searchTerm.replace(/\s/g, ''); // Remove spaces
        
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
        
        switch (this.searchType) {
            case 'abn':
                if (!/^\d{11}$/.test(term.replace(/\s/g, ''))) {
                    this.showError('Please enter a valid 11-digit ABN number');
                    return false;
                }
                break;
            case 'acn':
                if (!/^\d{9}$/.test(term.replace(/\s/g, ''))) {
                    this.showError('Please enter a valid 9-digit ACN number');
                    return false;
                }
                break;
            case 'name':
                if (term.length < 2) {
                    this.showError('Please enter at least 2 characters for company name search');
                    return false;
                }
                break;
        }
        
        return true;
    }

    async performSearch() {
        this.isLoading = true;
        this.clearMessages();
        
        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const response = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (response.success) {
                this.processSearchResults(response.data);
                this.hasSearched = true;
                
                // Dispatch search success event
                const successEvent = new CustomEvent('searchsuccess', {
                    detail: {
                        searchTerm: this.searchTerm,
                        searchType: this.searchType,
                        resultCount: this.allResults.length,
                        results: this.allResults
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(successEvent);
                
            } else {
                this.showError(response.message || 'Search failed. Please try again.');
                this.hasSearched = true;
            }
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('An unexpected error occurred. Please try again.');
            this.hasSearched = true;
            
            // Dispatch error event
            const errorEvent = new CustomEvent('searcherror', {
                detail: {
                    errorMessage: error.message,
                    searchTerm: this.searchTerm,
                    searchType: this.searchType
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
            this.allResults = [];
            this.searchResults = [];
            return;
        }

        // Handle both single result and array of results
        const resultsArray = Array.isArray(data) ? data : [data];
        
        this.allResults = resultsArray.map((item, index) => {
            return {
                id: `result-${index}`,
                abnNumber: this.extractValue(item, 'abn.identifier_value') || 'N/A',
                entityName: this.extractValue(item, 'other_trading_name.organisation_name') || 'N/A',
                abnStatus: this.formatAbnStatus(item),
                entityType: this.extractValue(item, 'entity_type.entity_description') || 'N/A',
                gstStatus: this.formatGstStatus(item),
                mainBusinessLocation: this.extractValue(item, 'main_business_location') || 'N/A',
                asicNumber: this.extractValue(item, 'asic_number') || '',
                dgrEndorsement: this.formatDgrEndorsement(item),
                rawData: item
            };
        });

        // Set initial display results
        if (this.showPagination) {
            // Pagination component will handle the display
            this.searchResults = [];
        } else {
            this.searchResults = [...this.allResults];
        }
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

    formatDgrEndorsement(item) {
        const endorsement = this.extractValue(item, 'dgr_endorsement.entity_endorsement');
        const itemNumber = this.extractValue(item, 'dgr_endorsement.item_number');
        
        if (endorsement && itemNumber) {
            return `${endorsement} - ${itemNumber}`;
        }
        return endorsement || '';
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

    clearMessages() {
        this.errorMessage = '';
    }

    showError(message) {
        this.errorMessage = message;
        this.showToast('Error', message, 'error');
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Public API methods for parent components
    @api
    performSearchWithTerm(searchTerm) {
        this.searchTerm = searchTerm;
        this.detectSearchType();
        this.handleSearch();
    }

    @api
    clearResults() {
        this.searchResults = [];
        this.allResults = [];
        this.clearMessages();
        this.hasSearched = false;
    }

    @api
    getSelectedResults() {
        return this.allResults;
    }

    @api
    validateComponent() {
        return !this.errorMessage && (this.searchTerm.length >= 2);
    }

    @api
    refreshData() {
        if (this.searchTerm && this.hasSearched) {
            this.handleSearch();
        }
    }
}
