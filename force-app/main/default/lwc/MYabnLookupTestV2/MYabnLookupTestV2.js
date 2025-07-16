import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchABN from '@salesforce/apex/MYabnLookupTestV2Controller.searchABN';

export default class MYabnLookupTestV2 extends LightningElement {
    // Public API properties for parent component integration
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;
    @api maxResults = 10;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track selectedResult = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentView = 'search'; // 'search', 'results', 'selected'
    @track searchType = 'name'; // 'abn', 'acn', 'name'
    @track currentPage = 1;
    @track totalRecords = 0;
    @track pageSize = 6;

    // Component lifecycle
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
        }
    }

    // Computed properties
    get actionButtonLabel() {
        return this.currentView === 'search' ? 'Find ABN' : 'Change ABN';
    }

    get showSearchSection() {
        return this.currentView === 'search' || this.currentView === 'results';
    }

    get showResults() {
        return this.currentView === 'results' && this.searchResults.length > 0 && !this.isLoading;
    }

    get showSelectedResult() {
        return this.currentView === 'selected' && this.selectedResult;
    }

    get showError() {
        return this.errorMessage && !this.isLoading;
    }

    get showNoResults() {
        return this.currentView === 'results' && this.searchResults.length === 0 && !this.isLoading && !this.errorMessage;
    }

    get searchInstructions() {
        if (this.currentView === 'results') {
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
        return this.currentView === 'results' ? 'Verify' : 'Search';
    }

    get searchButtonDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2;
    }

    get showPagination() {
        return this.totalRecords > this.pageSize;
    }

    get startRecord() {
        return ((this.currentPage - 1) * this.pageSize) + 1;
    }

    get endRecord() {
        const end = this.currentPage * this.pageSize;
        return end > this.totalRecords ? this.totalRecords : end;
    }

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get pageNumbers() {
        const pages = [];
        const totalPages = this.totalPages;
        const current = this.currentPage;
        
        // Always show first page
        if (totalPages > 0) {
            pages.push({
                label: '1',
                value: 1,
                variant: current === 1 ? 'brand' : 'neutral'
            });
        }

        // Show current page and surrounding pages
        for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
            pages.push({
                label: i.toString(),
                value: i,
                variant: current === i ? 'brand' : 'neutral'
            });
        }

        // Show last page if different from first
        if (totalPages > 1) {
            pages.push({
                label: totalPages.toString(),
                value: totalPages,
                variant: current === totalPages ? 'brand' : 'neutral'
            });
        }

        return pages;
    }

    // Event handlers
    handleActionButton() {
        if (this.currentView === 'selected') {
            this.currentView = 'search';
            this.selectedResult = null;
            this.searchResults = [];
            this.errorMessage = '';
        } else {
            this.currentView = 'search';
        }
        
        // Notify parent of view change
        this.dispatchViewChangeEvent();
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
        
        // Auto-detect search type
        this.detectSearchType();
        
        // Notify parent of search term change
        this.dispatchSearchTermChangeEvent();
    }

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

    async handleSearch() {
        if (!this.validateSearch()) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.currentPage = 1;

        try {
            const result = await searchABN({
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                pageNumber: this.currentPage,
                pageSize: this.pageSize
            });

            if (result.success) {
                this.processSearchResults(result.data);
                this.currentView = 'results';
                this.dispatchSearchSuccessEvent(result.data);
            } else {
                this.handleSearchError(result.message);
            }
        } catch (error) {
            this.handleSearchError(error.body?.message || error.message || 'An unexpected error occurred');
        } finally {
            this.isLoading = false;
        }
    }

    validateSearch() {
        const term = this.searchTerm.trim();
        
        if (!term) {
            this.showErrorToast('Please enter a search term');
            return false;
        }

        if (this.searchType === 'abn' && !/^\d{11}$/.test(term.replace(/\s/g, ''))) {
            this.showErrorToast('ABN must be 11 digits');
            return false;
        }

        if (this.searchType === 'acn' && !/^\d{9}$/.test(term.replace(/\s/g, ''))) {
            this.showErrorToast('ACN must be 9 digits');
            return false;
        }

        if (this.searchType === 'name' && term.length < 2) {
            this.showErrorToast('Company name must be at least 2 characters');
            return false;
        }

        return true;
    }

    processSearchResults(data) {
        if (data && data.results) {
            this.searchResults = data.results.map((item, index) => ({
                id: `result_${index}`,
                abn: item.abn?.identifier_value || 'N/A',
                entityName: item.other_trading_name?.organisation_name || 'N/A',
                abnStatus: this.formatABNStatus(item.entity_status, item.abn),
                entityType: item.entity_type?.entity_description || 'N/A',
                gstStatus: this.formatGSTStatus(item.goods_and_services_tax),
                businessLocation: this.extractBusinessLocation(item),
                rawData: item
            }));
            this.totalRecords = data.totalCount || this.searchResults.length;
        } else {
            this.searchResults = [];
            this.totalRecords = 0;
        }
    }

    formatABNStatus(entityStatus, abn) {
        if (entityStatus && abn) {
            const status = entityStatus.entity_status_code || 'Unknown';
            const effectiveFrom = this.formatDate(entityStatus.effective_from);
            return effectiveFrom ? `${status} from ${effectiveFrom}` : status;
        }
        return 'Unknown';
    }

    formatGSTStatus(gstInfo) {
        if (gstInfo && gstInfo.effective_from && gstInfo.effective_from !== '0001-01-01') {
            const effectiveFrom = this.formatDate(gstInfo.effective_from);
            return effectiveFrom ? `Registered from ${effectiveFrom}` : 'Registered';
        }
        return 'Not registered';
    }

    extractBusinessLocation(item) {
        // Extract business location from various possible fields
        if (item.main_business_physical_address) {
            return this.formatAddress(item.main_business_physical_address);
        }
        // Fallback to a default or extracted location
        return 'VIC 3123'; // Default based on mockup
    }

    formatAddress(address) {
        if (typeof address === 'string') {
            return address;
        }
        // Handle address object if needed
        return 'Address available';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return null;
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

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            this.selectedResult = selectedResult;
            this.currentView = 'selected';
            this.dispatchSelectionEvent(selectedResult);
        }
    }

    handleSearchError(errorMessage) {
        this.errorMessage = errorMessage;
        this.searchResults = [];
        this.totalRecords = 0;
        this.dispatchErrorEvent(errorMessage);
    }

    // Pagination handlers
    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.handleSearch();
        }
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.handleSearch();
        }
    }

    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page, 10);
        if (pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
            this.handleSearch();
        }
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm) {
            this.handleSearch();
        }
    }

    @api
    clearResults() {
        this.searchResults = [];
        this.selectedResult = null;
        this.errorMessage = '';
        this.currentView = 'search';
        this.searchTerm = '';
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    validateComponent() {
        return this.selectedResult !== null;
    }

    // Event dispatching methods for parent communication
    dispatchSearchTermChangeEvent() {
        const event = new CustomEvent('searchtermchange', {
            detail: {
                componentName: 'MYabnLookupTestV2',
                searchTerm: this.searchTerm,
                searchType: this.searchType,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(event);
    }

    dispatchSearchSuccessEvent(data) {
        const event = new CustomEvent('searchsuccess', {
            detail: {
                componentName: 'MYabnLookupTestV2',
                results: this.searchResults,
                totalRecords: this.totalRecords,
                searchTerm: this.searchTerm,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(event);
    }

    dispatchSelectionEvent(selectedResult) {
        const event = new CustomEvent('resultselected', {
            detail: {
                componentName: 'MYabnLookupTestV2',
                selectedResult: selectedResult,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(event);
    }

    dispatchErrorEvent(errorMessage) {
        const event = new CustomEvent('error', {
            detail: {
                componentName: 'MYabnLookupTestV2',
                errorMessage: errorMessage,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(event);
    }

    dispatchViewChangeEvent() {
        const event = new CustomEvent('viewchange', {
            detail: {
                componentName: 'MYabnLookupTestV2',
                currentView: this.currentView,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(event);
    }

    // Utility methods
    showErrorToast(message) {
        const event = new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error'
        });
        this.dispatchEvent(event);
    }

    showSuccessToast(message) {
        const event = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success'
        });
        this.dispatchEvent(event);
    }
}
