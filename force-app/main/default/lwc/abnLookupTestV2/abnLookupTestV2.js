import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    // Public API properties for parent component configuration
    @api recordId;
    @api configSettings = {};
    @api initialSearchTerm = '';
    @api pageSize = 10;
    @api isReadOnly = false;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track currentPage = 1;
    @track totalResults = 0;
    @track selectedResult = null;

    // Private properties
    searchTimeout;
    detectedSearchType = '';
    
    // Lifecycle hooks
    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
        }
    }

    // Getters for dynamic content
    get searchPlaceholder() {
        switch (this.detectedSearchType) {
            case 'ABN':
                return 'Enter 11-digit ABN number';
            case 'ACN':
                return 'Enter 9-digit ACN number';
            case 'NAME':
                return 'Enter company name (minimum 2 characters)';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchButtonLabel() {
        return this.detectedSearchType === 'ABN' ? 'Verify' : 'Search';
    }

    get searchTypeInfo() {
        if (!this.searchTerm) {
            return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
        }
        
        switch (this.detectedSearchType) {
            case 'ABN':
                return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
            case 'ACN':
                return 'Searching by Australian Company Number (ACN).';
            case 'NAME':
                return 'Searching by company/business name.';
            default:
                return '';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.searchTerm || this.searchTerm.length < 2 || this.isReadOnly;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading && !this.errorMessage;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && this.searchResults.length === 0 && this.searchTerm;
    }

    get paginatedResults() {
        if (!this.searchResults || this.searchResults.length === 0) {
            return [];
        }
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.searchResults.slice(startIndex, endIndex);
    }

    get showPagination() {
        return this.hasResults && this.searchResults.length > this.pageSize;
    }

    get paginationInfo() {
        const startRecord = (this.currentPage - 1) * this.pageSize + 1;
        const endRecord = Math.min(this.currentPage * this.pageSize, this.searchResults.length);
        return {
            startRecord: startRecord,
            endRecord: endRecord,
            totalRecords: this.searchResults.length
        };
    }

    get pageNumbers() {
        const totalPages = Math.ceil(this.searchResults.length / this.pageSize);
        const pages = [];
        
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            pages.push({
                label: i.toString(),
                value: i,
                variant: i === this.currentPage ? 'brand' : 'neutral'
            });
        }
        
        return pages;
    }

    get isPreviousDisabled() {
        return this.currentPage <= 1;
    }

    get isNextDisabled() {
        const totalPages = Math.ceil(this.searchResults.length / this.pageSize);
        return this.currentPage >= totalPages;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectedSearchType = this.detectSearchType(this.searchTerm);
        this.clearResults();
        
        // Dispatch change event to parent
        this.dispatchDataChangeEvent('searchTermChange', {
            searchTerm: this.searchTerm,
            searchType: this.detectedSearchType
        });
    }

    handleKeyUp(event) {
        if (event.keyCode === 13 && !this.isSearchDisabled) {
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (this.isSearchDisabled) {
            return;
        }

        if (!this.validateSearchInput()) {
            return;
        }

        this.clearResults();
        this.isLoading = true;

        try {
            const result = await searchABN({
                searchTerm: this.searchTerm,
                searchType: this.detectedSearchType
            });

            if (result.success) {
                this.searchResults = result.data || [];
                this.currentPage = 1;
                
                if (this.searchResults.length === 0) {
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'No Results',
                        message: 'No matching results found for your search.',
                        variant: 'warning'
                    }));
                } else {
                    this.dispatchSuccessEvent('searchCompleted', {
                        resultsCount: this.searchResults.length,
                        searchTerm: this.searchTerm
                    });
                }
            } else {
                this.errorMessage = result.message || 'An error occurred during search.';
                this.dispatchErrorEvent('searchError', this.errorMessage);
            }
        } catch (error) {
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.dispatchErrorEvent('searchError', error.message);
        } finally {
            this.isLoading = false;
        }
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            this.selectedResult = selectedResult;
            
            // Dispatch selection event to parent
            this.dispatchSuccessEvent('resultSelected', {
                selectedResult: selectedResult,
                searchTerm: this.searchTerm
            });

            // Show success toast
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: `Selected: ${selectedResult.entityName}`,
                variant: 'success'
            }));
        }
    }

    // Pagination handlers
    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNextPage() {
        const totalPages = Math.ceil(this.searchResults.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
        }
    }

    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page);
        this.currentPage = pageNumber;
    }

    // Utility methods
    detectSearchType(input) {
        if (!input) return '';
        
        const cleanInput = input.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(cleanInput)) {
            return 'ABN';
        } else if (/^\d{9}$/.test(cleanInput)) {
            return 'ACN';
        } else if (input.length >= 2) {
            return 'NAME';
        }
        
        return '';
    }

    validateSearchInput() {
        const cleanInput = this.searchTerm.replace(/\s/g, '');
        
        switch (this.detectedSearchType) {
            case 'ABN':
                if (!/^\d{11}$/.test(cleanInput)) {
                    this.errorMessage = 'ABN must be exactly 11 digits.';
                    return false;
                }
                break;
            case 'ACN':
                if (!/^\d{9}$/.test(cleanInput)) {
                    this.errorMessage = 'ACN must be exactly 9 digits.';
                    return false;
                }
                break;
            case 'NAME':
                if (this.searchTerm.length < 2) {
                    this.errorMessage = 'Company name must be at least 2 characters.';
                    return false;
                }
                break;
            default:
                this.errorMessage = 'Please enter a valid ABN, ACN, or company name.';
                return false;
        }
        
        return true;
    }

    clearResults() {
        this.searchResults = [];
        this.errorMessage = '';
        this.currentPage = 1;
        this.selectedResult = null;
    }

    // Parent communication methods
    dispatchDataChangeEvent(action, data) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'abnLookupTestV2',
                action: action,
                data: data,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(changeEvent);
    }

    dispatchErrorEvent(action, errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV2',
                action: action,
                errorMessage: errorMessage,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchSuccessEvent(action, data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'abnLookupTestV2',
                action: action,
                data: data,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm) {
            this.handleSearch();
        }
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.detectedSearchType = '';
        this.clearResults();
    }

    @api
    getSelectedResult() {
        return this.selectedResult;
    }

    @api
    validateComponent() {
        return {
            isValid: !this.errorMessage && (this.selectedResult || this.searchResults.length > 0),
            selectedResult: this.selectedResult,
            searchTerm: this.searchTerm
        };
    }
}
