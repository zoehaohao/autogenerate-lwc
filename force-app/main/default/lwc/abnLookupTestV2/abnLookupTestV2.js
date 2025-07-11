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

    get displayedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.results.slice(start, end);
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
        if (!this.searchTerm || this.searchTerm.length < 2) {
            this.errorMessage = 'Please enter at least 2 characters';
            return;
        }

        this.isSearching = true;
        this.errorMessage = '';
        this.results = [];

        try {
            const results = await searchABN({ searchTerm: this.searchTerm });
            this.results = results;
            this.currentPage = 1;
            
            if (!results.length) {
                this.errorMessage = `No matching results for ${this.searchTerm}, please check the inputs and try again.`;
            }
        } catch (error) {
            this.errorMessage = error.body?.message || 'An error occurred while searching. Please try again.';
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

    handlePageChange(event) {
        this.currentPage = parseInt(event.target.dataset.page, 10);
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
}
