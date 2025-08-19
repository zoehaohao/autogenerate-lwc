import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/strandsTestV6Controller.searchABN';

export default class StrandsTestV6 extends LightningElement {
    @track searchTerm = '';
    @track results = [];
    @track currentPage = 1;
    @track totalPages = 0;
    @track itemsPerPage = 10;
    @track isLoading = false;
    @track error;

    // Computed properties
    get hasResults() {
        return this.results && this.results.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && this.searchTerm && this.results.length === 0;
    }

    get displayedResults() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.results.slice(start, end);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get pageNumbers() {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    getPageButtonVariant(pageNumber) {
        return pageNumber === this.currentPage ? 'brand' : 'neutral';
    }

    // Event handlers
    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    async handleSearch() {
        if (!this.searchTerm) return;

        this.isLoading = true;
        try {
            const results = await searchABN({ searchTerm: this.searchTerm });
            this.results = results;
            this.totalPages = Math.ceil(results.length / this.itemsPerPage);
            this.currentPage = 1;
            this.error = undefined;
        } catch (error) {
            this.error = error.message;
            this.results = [];
        } finally {
            this.isLoading = false;
        }
    }

    handleSelect(event) {
        const selectedAbn = event.currentTarget.dataset.abn;
        const selectedResult = this.results.find(result => result.abn === selectedAbn);
        
        // Dispatch custom event with selected ABN details
        this.dispatchEvent(new CustomEvent('abnselected', {
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
        this.currentPage = pageNumber;
    }
}