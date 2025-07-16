import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newabnLookupTestV2Controller.searchABN';

export default class NewabnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentView = 'findAbn'; // 'findAbn' or 'changeAbn'
    @track searchType = 'name'; // 'abn', 'acn', 'name'
    
    // Pagination properties
    @track currentPage = 1;
    @track pageSize = 10;
    @track totalRecords = 0;
    @track allResults = [];

    // Computed properties
    get showFindAbnSection() {
        return this.currentView === 'findAbn';
    }

    get showSelectedResult() {
        return this.currentView === 'changeAbn' && this.selectedResult;
    }

    get findAbnButtonClass() {
        return this.currentView === 'findAbn' 
            ? 'slds-button slds-button_brand' 
            : 'slds-button slds-button_neutral';
    }

    get changeAbnButtonClass() {
        return this.currentView === 'changeAbn' 
            ? 'slds-button slds-button_brand' 
            : 'slds-button slds-button_neutral';
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

    get searchButtonLabel() {
        return this.searchType === 'abn' ? 'Verify' : 'Search';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.isValidSearchTerm;
    }

    get isValidSearchTerm() {
        if (!this.searchTerm || this.searchTerm.trim().length < 2) {
            return false;
        }
        
        const trimmed = this.searchTerm.trim();
        
        // ABN validation (11 digits)
        if (/^\d{11}$/.test(trimmed)) {
            this.searchType = 'abn';
            return true;
        }
        
        // ACN validation (9 digits)
        if (/^\d{9}$/.test(trimmed)) {
            this.searchType = 'acn';
            return true;
        }
        
        // Company name validation (minimum 2 characters)
        if (trimmed.length >= 2) {
            this.searchType = 'name';
            return true;
        }
        
        return false;
    }

    get showResults() {
        return !this.isLoading && !this.showError && !this.showNoResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.showError && this.searchResults.length === 0 && this.searchTerm;
    }

    get showError() {
        return !this.isLoading && this.errorMessage;
    }

    get showPagination() {
        return this.totalRecords > this.pageSize;
    }

    get startRecord() {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endRecord() {
        return Math.min(this.currentPage * this.pageSize, this.totalRecords);
    }

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get isPreviousDisabled() {
        return this.currentPage <= 1;
    }

    get isNextDisabled() {
        return this.currentPage >= this.totalPages;
    }

    get pageNumbers() {
        const pages = [];
        const totalPages = this.totalPages;
        const current = this.currentPage;
        
        // Show first page
        if (current > 3) {
            pages.push({
                number: 1,
                cssClass: 'slds-button slds-button_neutral'
            });
            if (current > 4) {
                pages.push({
                    number: '...',
                    cssClass: 'slds-button slds-button_neutral',
                    disabled: true
                });
            }
        }
        
        // Show pages around current
        for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
            pages.push({
                number: i,
                cssClass: i === current 
                    ? 'slds-button slds-button_brand' 
                    : 'slds-button slds-button_neutral'
            });
        }
        
        // Show last page
        if (current < totalPages - 2) {
            if (current < totalPages - 3) {
                pages.push({
                    number: '...',
                    cssClass: 'slds-button slds-button_neutral',
                    disabled: true
                });
            }
            pages.push({
                number: totalPages,
                cssClass: 'slds-button slds-button_neutral'
            });
        }
        
        return pages;
    }

    // Event handlers
    handleFindAbnClick() {
        this.currentView = 'findAbn';
        this.clearSearch();
    }

    handleChangeAbnClick() {
        this.currentView = 'changeAbn';
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.clearResults();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13 && this.isValidSearchTerm) {
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (!this.isValidSearchTerm) {
            return;
        }

        this.isLoading = true;
        this.clearResults();

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSuccessEvent(result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchErrorEvent(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selected = this.allResults.find(result => result.id === resultId);
        
        if (selected) {
            this.selectedResult = selected;
            this.currentView = 'changeAbn';
            this.dispatchSelectionEvent(selected);
        }
    }

    handlePageClick(event) {
        const page = parseInt(event.target.dataset.page);
        if (!isNaN(page)) {
            this.currentPage = page;
            this.updateDisplayedResults();
        }
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplayedResults();
        }
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateDisplayedResults();
        }
    }

    // Helper methods
    processSearchResults(data) {
        if (!data) {
            this.allResults = [];
            this.searchResults = [];
            this.totalRecords = 0;
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.allResults = results.map((item, index) => ({
            id: `result-${index}`,
            abnNumber: this.extractABNNumber(item),
            entityName: this.extractEntityName(item),
            abnStatus: this.extractABNStatus(item),
            entityType: this.extractEntityType(item),
            gstStatus: this.extractGSTStatus(item),
            businessLocation: this.extractBusinessLocation(item),
            rawData: item
        }));

        this.totalRecords = this.allResults.length;
        this.currentPage = 1;
        this.updateDisplayedResults();
    }

    updateDisplayedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.searchResults = this.allResults.slice(start, end);
    }

    extractABNNumber(item) {
        return item?.abn?.identifier_value || 'N/A';
    }

    extractEntityName(item) {
        return item?.other_trading_name?.organisation_name || 'N/A';
    }

    extractABNStatus(item) {
        const status = item?.entity_status?.entity_status_code;
        const effectiveFrom = item?.entity_status?.effective_from;
        return status && effectiveFrom ? `${status} from ${effectiveFrom}` : 'N/A';
    }

    extractEntityType(item) {
        return item?.entity_type?.entity_description || 'N/A';
    }

    extractGSTStatus(item) {
        const effectiveFrom = item?.goods_and_services_tax?.effective_from;
        return effectiveFrom ? `Registered from ${effectiveFrom}` : 'Not registered';
    }

    extractBusinessLocation(item) {
        return item?.asic_number || 'N/A';
    }

    clearSearch() {
        this.searchTerm = '';
        this.clearResults();
    }

    clearResults() {
        this.searchResults = [];
        this.allResults = [];
        this.errorMessage = '';
        this.totalRecords = 0;
        this.currentPage = 1;
    }

    // Parent communication methods
    dispatchSuccessEvent(result) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'newabnLookupTestV2',
                result: result,
                message: 'Search completed successfully',
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'newabnLookupTestV2',
                errorMessage: error,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('selection', {
            detail: {
                componentName: 'newabnLookupTestV2',
                selectedResult: selectedResult,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectionEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.clearSearch();
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
        this.selectedResult = null;
        this.currentView = 'findAbn';
    }
}
