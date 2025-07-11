import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @track searchTerm = '';
    @track results = [];
    @track errorMessage = '';
    @track isSearching = false;
    @track currentPage = 1;
    @track pageSize = 10;
    @track totalPages = 0;

    get hasResults() {
        return this.results.length > 0;
    }

    get displayedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.results.slice(start, end);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get pageNumbers() {
        let pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    getPageButtonVariant(pageNumber) {
        return pageNumber === this.currentPage ? 'brand' : 'neutral';
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

        try {
            const result = await searchABN({ searchTerm: this.searchTerm });
            if (result.success) {
                this.results = result.data;
                this.totalPages = Math.ceil(this.results.length / this.pageSize);
                this.currentPage = 1;
            } else {
                this.errorMessage = result.message;
                this.results = [];
            }
        } catch (error) {
            this.errorMessage = 'An error occurred while searching. Please try again.';
            this.results = [];
        } finally {
            this.isSearching = false;
        }
    }

    handleSelect(event) {
        const selectedAbn = event.currentTarget.dataset.id;
        // Dispatch event with selected ABN
        this.dispatchEvent(new CustomEvent('select', {
            detail: selectedAbn
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
}
