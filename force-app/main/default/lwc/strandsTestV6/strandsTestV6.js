import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/strandsTestV6Controller.searchABN';

export default class StrandsTestV6 extends LightningElement {
    @track searchTerm = '';
    @track results = [];
    @track currentPage = 1;
    @track totalPages = 1;
    @track itemsPerPage = 10;
    @track displayedResults = [];

    // Computed properties
    get hasResults() {
        return this.results.length > 0;
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

    get getPageButtonVariant() {
        return (pageNumber) => {
            return pageNumber === this.currentPage ? 'brand' : 'neutral';
        };
    }

    // Event handlers
    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    async handleSearch() {
        if (!this.searchTerm) return;
        
        try {
            const searchResults = await searchABN({ searchTerm: this.searchTerm });
            this.results = searchResults.map(result => ({
                abn: result.abn,
                entityName: result.entityName,
                abnStatus: result.abnStatus,
                entityType: result.entityType,
                gst: result.gst,
                location: result.location
            }));
            
            this.totalPages = Math.ceil(this.results.length / this.itemsPerPage);
            this.currentPage = 1;
            this.updateDisplayedResults();
        } catch (error) {
            console.error('Error searching ABN:', error);
            // Handle error appropriately
        }
    }

    handleSelect(event) {
        const selectedAbn = event.currentTarget.dataset.abn;
        const selectedResult = this.results.find(result => result.abn === selectedAbn);
        
        // Dispatch custom event with selected ABN details
        this.dispatchEvent(new CustomEvent('abnselected', {
            detail: selectedResult
        }));
    }

    handlePageChange(event) {
        const pageNumber = parseInt(event.currentTarget.dataset.page, 10);
        this.currentPage = pageNumber;
        this.updateDisplayedResults();
    }

    handlePrevious() {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.updateDisplayedResults();
        }
    }

    handleNext() {
        if (!this.isLastPage) {
            this.currentPage++;
            this.updateDisplayedResults();
        }
    }

    // Helper methods
    updateDisplayedResults() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.displayedResults = this.results.slice(start, end);
    }
}