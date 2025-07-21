import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV4Controller.searchABN';

export default class AbnLookupTestV4 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    @api pageSize = 10;

    @track searchTerm = '';
    @track searchResults = [];
    @track selectedEntity = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentPage = 1;
    @track totalResults = 0;
    @track mode = 'search'; // 'search' or 'readonly'

    // Computed properties
    get isSearchMode() {
        return this.mode === 'search';
    }

    get isReadOnlyMode() {
        return this.mode === 'readonly';
    }

    get hasResults() {
        return !this.isLoading && this.searchResults.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && this.searchResults.length === 0 && this.searchTerm && !this.errorMessage;
    }

    get totalPages() {
        return Math.ceil(this.totalResults / this.pageSize);
    }

    get startRecord() {
        return ((this.currentPage - 1) * this.pageSize) + 1;
    }

    get endRecord() {
        const end = this.currentPage * this.pageSize;
        return end > this.totalResults ? this.totalResults : end;
    }

    get paginatedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.searchResults.slice(start, end).map(result => ({
            ...result,
            formattedABN: this.formatABN(result.ABN)
        }));
    }

    get showPagination() {
        return this.totalPages > 1;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get searchButtonClass() {
        return `slds-size_1-of-1 slds-medium-size_auto`;
    }

    get resultCardClass() {
        return `slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3 slds-x-large-size_1-of-4`;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (!this.searchTerm.trim()) {
            this.errorMessage = 'Please enter a search term';
            return;
        }

        if (!this.validateInput(this.searchTerm.trim())) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.currentPage = 1;

        try {
            const result = await searchABN({ 
                searchTerm: this.searchTerm.trim() 
            });

            if (result.success) {
                this.searchResults = result.data || [];
                this.totalResults = this.searchResults.length;
                
                if (this.searchResults.length === 0) {
                    // No results found - showNoResults getter will handle display
                }
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.searchResults = [];
                this.totalResults = 0;
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An error occurred while searching. Please try again.';
            this.searchResults = [];
            this.totalResults = 0;
            
            // Dispatch error event to parent
            this.dispatchErrorEvent(error.body?.message || error.message || 'Search failed');
        } finally {
            this.isLoading = false;
        }
    }

    handleSelect(event) {
        const selectedId = event.target.dataset.id;
        const selected = this.searchResults.find(result => result.id === selectedId);
        
        if (selected) {
            this.selectedEntity = {
                ...selected,
                formattedABN: this.formatABN(selected.ABN)
            };
            this.mode = 'readonly';
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(this.selectedEntity);
        }
    }

    handleChangeABN() {
        this.mode = 'search';
        this.selectedEntity = null;
        this.searchResults = [];
        this.totalResults = 0;
        this.currentPage = 1;
        this.errorMessage = '';
        this.searchTerm = '';
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    // Validation methods
    validateInput(input) {
        // Check if input is numeric (ABN or ACN)
        if (/^\d+$/.test(input)) {
            if (input.length === 11) {
                // Valid ABN length
                return true;
            } else if (input.length === 9) {
                // Valid ACN length
                return true;
            } else {
                this.errorMessage = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
                return false;
            }
        }
        
        // Non-numeric input (business name) - allow if not empty
        return input.trim().length > 0;
    }

    formatABN(abn) {
        if (!abn) return '';
        const abnString = abn.toString();
        if (abnString.length === 11) {
            return `${abnString.substring(0, 2)} ${abnString.substring(2, 5)} ${abnString.substring(5, 8)} ${abnString.substring(8, 11)}`;
        }
        return abnString;
    }

    // Parent communication methods
    dispatchSelectionEvent(entity) {
        const selectionEvent = new CustomEvent('entityselected', {
            detail: {
                componentName: 'abnLookupTestV4',
                selectedEntity: entity,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV4',
                errorMessage: errorMessage,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchSuccessEvent(message) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'abnLookupTestV4',
                message: message,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.handleSearch();
    }

    @api
    validateComponent() {
        return this.selectedEntity !== null;
    }

    @api
    clearSelection() {
        this.handleChangeABN();
    }

    @api
    getSelectedEntity() {
        return this.selectedEntity;
    }
}
