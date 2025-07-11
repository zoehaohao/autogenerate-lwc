import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @track searchTerm = '';
    @track results = [];
    @track errorMessage = '';
    @track isSearching = false;
    @track currentPage = 1;
    @track pageSize = 10;

    get hasResults() {
        return this.results && this.results.length > 0;
    }

    get totalPages() {
        return Math.ceil(this.results.length / this.pageSize);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get displayedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.results.slice(start, end);
    }

    get pageNumbers() {
        let pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    async handleSearch() {
        if (!this.searchTerm) {
            this.errorMessage = 'Please enter a search term';
            return;
        }

        this.isSearching = true;
        this.errorMessage = '';
        this.results = [];

        try {
            const response = await searchABN({ searchTerm: this.searchTerm });
            if (response.success) {
                this.results = response.data;
                this.currentPage = 1;
            } else {
                this.errorMessage = response.message || 'Search failed. Please try again.';
            }
        } catch (error) {
            this.errorMessage = error.message || 'An unexpected error occurred';
        } finally {
            this.isSearching = false;
        }
    }

    handleSelect(event) {
        const abnId = event.currentTarget.dataset.id;
        // Handle selection logic here
        const selectedResult = this.results.find(result => 
            result.abn.identifier_value === abnId
        );
        
        // Dispatch custom event with selected data
        this.dispatchEvent(new CustomEvent('selection', {
            detail: selectedResult
        }));
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

    handlePageChange(event) {
        const pageNumber = parseInt(event.currentTarget.dataset.page, 10);
        this.currentPage = pageNumber;
    }

    getPageButtonVariant(pageNumber) {
        return parseInt(pageNumber, 10) === this.currentPage ? 'brand' : 'neutral';
    }
}
