import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newabnLookupTestV2Controller.searchABN';

export default class NewabnLookupTestV2 extends LightningElement {
    @api recordId;
    @track searchTerm = '';
    @track results = [];
    @track errorMessage = '';
    @track isSearching = false;
    @track currentPage = 1;
    @track pageSize = 10;
    
    get headerTitle() {
        return 'ABN lookup pattern';
    }

    get searchInstructions() {
        return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
    }

    get searchPlaceholder() {
        return 'Search by Business name, ABN or ACN';
    }

    get buttonLabel() {
        return this.detectSearchType() === 'ABN' ? 'Verify' : 'Search';
    }

    get hasResults() {
        return this.results && this.results.length > 0;
    }

    get displayedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.results.slice(start, end);
    }

    get totalPages() {
        return Math.ceil(this.results.length / this.pageSize);
    }

    get pageNumbers() {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    getPageButtonVariant(pageNumber) {
        return pageNumber === this.currentPage ? 'brand' : 'neutral';
    }

    detectSearchType() {
        const term = this.searchTerm.trim();
        if (/^\d{11}$/.test(term)) return 'ABN';
        if (/^\d{9}$/.test(term)) return 'ACN';
        return 'NAME';
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    async handleSearch() {
        if (!this.validateSearch()) return;

        this.isSearching = true;
        this.errorMessage = '';
        this.results = [];

        try {
            const searchType = this.detectSearchType();
            const response = await searchABN({
                searchTerm: this.searchTerm,
                searchType: searchType
            });

            if (response.success) {
                this.results = response.data;
                this.currentPage = 1;
            } else {
                this.errorMessage = response.message || 'No matching results found, please check the inputs and try again.';
            }
        } catch (error) {
            this.errorMessage = 'An error occurred while searching. Please try again.';
            console.error('Search error:', error);
        } finally {
            this.isSearching = false;
        }
    }

    validateSearch() {
        const term = this.searchTerm.trim();
        if (!term) {
            this.errorMessage = 'Please enter a search term';
            return false;
        }

        const searchType = this.detectSearchType();
        if (searchType === 'NAME' && term.length < 2) {
            this.errorMessage = 'Please enter at least 2 characters for name search';
            return false;
        }

        return true;
    }

    handleSelect(event) {
        const selectedAbn = event.currentTarget.dataset.id;
        const selectedResult = this.results.find(result => 
            result.abn.identifier_value === selectedAbn
        );

        this.dispatchEvent(new CustomEvent('select', {
            detail: selectedResult,
            bubbles: true,
            composed: true
        }));
    }

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

    handlePageChange(event) {
        const pageNumber = parseInt(event.currentTarget.dataset.page, 10);
        if (pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
        }
    }
}
