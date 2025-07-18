import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    @api pageSize = 10;

    @track searchTerm = '';
    @track searchResults = [];
    @track selectedEntity = null;
    @track currentPage = 1;
    @track totalResults = 0;
    @track isLoading = false;
    @track errorMessage = '';
    @track hasSearched = false;

    // Component state management
    get isSearchMode() {
        return !this.selectedEntity || this.isChangingABN;
    }

    get isReadOnlyMode() {
        return this.selectedEntity && !this.isChangingABN;
    }

    get hasResults() {
        return this.searchResults.length > 0 && this.hasSearched && !this.isLoading;
    }

    get showNoResults() {
        return this.searchResults.length === 0 && this.hasSearched && !this.isLoading && !this.errorMessage;
    }

    get showPagination() {
        return this.totalResults > this.pageSize;
    }

    // Pagination calculations
    get totalPages() {
        return Math.ceil(this.totalResults / this.pageSize);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get startRecord() {
        return ((this.currentPage - 1) * this.pageSize) + 1;
    }

    get endRecord() {
        return Math.min(this.currentPage * this.pageSize, this.totalResults);
    }

    get currentPageResults() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.searchResults.slice(startIndex, endIndex);
    }

    // Responsive grid classes
    get resultCardClass() {
        return 'slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3 slds-x-large-size_1-of-4';
    }

    // Pagination page numbers
    get pageNumbers() {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push({
                label: i.toString(),
                value: i,
                variant: i === this.currentPage ? 'brand' : 'neutral'
            });
        }
        return pages;
    }

    // Selected entity display fields
    get selectedEntityFields() {
        if (!this.selectedEntity) return [];
        
        return [
            { label: 'Entity Name', value: this.selectedEntity.entityName || 'N/A' },
            { label: 'Business Name', value: this.selectedEntity.businessName || 'N/A' },
            { label: 'Status', value: this.selectedEntity.status || 'N/A' },
            { label: 'State', value: this.selectedEntity.state || 'N/A' },
            { label: 'Entity Type', value: this.selectedEntity.entityType || 'N/A' },
            { label: 'Last Updated', value: this.selectedEntity.lastUpdated || 'N/A' }
        ];
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.clearError();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) {
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            this.showError('Please enter a search term');
            return;
        }

        // Validate input format
        const validationError = this.validateInput(this.searchTerm.trim());
        if (validationError) {
            this.showError(validationError);
            return;
        }

        this.isLoading = true;
        this.clearError();
        this.currentPage = 1;

        try {
            const result = await searchABN({ 
                searchTerm: this.searchTerm.trim(),
                pageSize: this.pageSize,
                pageNumber: this.currentPage
            });

            if (result.success) {
                this.processSearchResults(result.data);
                this.hasSearched = true;
            } else {
                this.showError(result.message || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('An error occurred while searching. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selected = this.searchResults.find(result => result.id === selectedId);
        
        if (selected) {
            this.selectedEntity = { ...selected };
            this.isChangingABN = false;
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(selected);
        }
    }

    handleChangeABN() {
        this.isChangingABN = true;
        this.clearSearchResults();
    }

    // Pagination handlers
    handlePrevious() {
        if (!this.isFirstPage) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (!this.isLastPage) {
            this.currentPage++;
        }
    }

    handlePageClick(event) {
        const page = parseInt(event.target.dataset.page, 10);
        if (page !== this.currentPage) {
            this.currentPage = page;
        }
    }

    // Utility methods
    validateInput(input) {
        const numericInput = input.replace(/\s/g, '');
        
        if (/^\d+$/.test(numericInput)) {
            if (numericInput.length === 11) {
                return null; // Valid ABN
            } else if (numericInput.length === 9) {
                return null; // Valid ACN
            } else {
                return 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
            }
        }
        
        return null; // Text search is valid
    }

    processSearchResults(data) {
        if (data && data.results) {
            this.searchResults = data.results.map((result, index) => ({
                id: `result_${index}`,
                abn: result.abn,
                acn: result.acn,
                entityName: result.entityName,
                businessName: result.businessName,
                status: result.status,
                state: result.state,
                entityType: result.entityType,
                lastUpdated: result.lastUpdated,
                displayNumber: this.formatDisplayNumber(result.abn, result.acn)
            }));
            this.totalResults = data.totalCount || this.searchResults.length;
        } else {
            this.searchResults = [];
            this.totalResults = 0;
        }
    }

    formatDisplayNumber(abn, acn) {
        if (abn) {
            return `ABN ${this.formatABN(abn)}`;
        } else if (acn) {
            return `ACN ${this.formatACN(acn)}`;
        }
        return 'N/A';
    }

    formatABN(abn) {
        if (!abn) return '';
        const cleaned = abn.replace(/\s/g, '');
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    }

    formatACN(acn) {
        if (!acn) return '';
        const cleaned = acn.replace(/\s/g, '');
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }

    showError(message) {
        this.errorMessage = message;
    }

    clearError() {
        this.errorMessage = '';
    }

    clearSearchResults() {
        this.searchResults = [];
        this.totalResults = 0;
        this.hasSearched = false;
        this.currentPage = 1;
    }

    dispatchSelectionEvent(selectedEntity) {
        const selectionEvent = new CustomEvent('abnselection', {
            detail: {
                componentName: 'abnLookupTestV2',
                selectedEntity: selectedEntity,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    // Public API methods
    @api
    refreshData() {
        this.clearSearchResults();
        this.clearError();
    }

    @api
    validateComponent() {
        return this.selectedEntity !== null;
    }

    @api
    getSelectedEntity() {
        return this.selectedEntity;
    }

    @api
    clearSelection() {
        this.selectedEntity = null;
        this.isChangingABN = false;
        this.clearSearchResults();
    }
}
