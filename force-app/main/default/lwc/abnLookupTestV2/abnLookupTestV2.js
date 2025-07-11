import { LightningElement, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @track searchTerm = '';
    @track results = [];
    @track errorMessage = '';
    @track isLoading = false;
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

    get pageNumbers() {
        let pages = [];
        for(let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    get displayedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = this.currentPage * this.pageSize;
        return this.results.slice(start, end);
    }

    get getPageButtonVariant() {
        return (pageNumber) => pageNumber === this.currentPage ? 'brand' : 'neutral';
    }

    handleSearchInput(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    async handleSearch() {
        if (!this.searchTerm) {
            this.errorMessage = 'Please enter a search term';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.results = [];

        try {
            const response = await searchABN({ searchTerm: this.searchTerm });
            if (response.success) {
                this.results = response.data;
                this.currentPage = 1;
            } else {
                this.errorMessage = response.message;
            }
        } catch (error) {
            this.errorMessage = 'An error occurred while searching. Please try again.';
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
        }
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
        const pageNumber = parseInt(event.target.dataset.page, 10);
        this.currentPage = pageNumber;
    }

    handleSelect(event) {
        const selectedAbn = event.target.dataset.id;
        // Dispatch event with selected ABN
        this.dispatchEvent(new CustomEvent('abnselected', {
            detail: selectedAbn
        }));
    }
}
