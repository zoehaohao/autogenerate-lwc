import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/strandsTestV10Controller.searchABN';

export default class StrandsTestV10 extends LightningElement {
    @api recordId;
    @track searchTerm = '';
    @track abnResults = [];
    @track currentPage = 1;
    @track totalPages = 0;
    @track pageSize = 10;
    @track isLoading = false;

    get hasResults() {
        return this.abnResults.length > 0;
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

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    async handleSearch() {
        if (!this.searchTerm) return;
        
        this.isLoading = true;
        try {
            const result = await searchABN({
                searchTerm: this.searchTerm,
                pageNumber: this.currentPage,
                pageSize: this.pageSize
            });
            
            this.abnResults = result.records.map(record => ({
                abn: record.abn,
                entityName: record.entityName,
                abnStatus: record.abnStatus,
                entityType: record.entityType,
                gst: record.gst,
                location: record.location
            }));
            
            this.totalPages = Math.ceil(result.totalRecords / this.pageSize);
        } catch (error) {
            console.error('Error searching ABN:', error);
            // Handle error appropriately
        } finally {
            this.isLoading = false;
        }
    }

    handleSelect(event) {
        const selectedAbn = event.currentTarget.dataset.abn;
        const selectedResult = this.abnResults.find(result => result.abn === selectedAbn);
        
        if (selectedResult) {
            const selectEvent = new CustomEvent('select', {
                detail: selectedResult
            });
            this.dispatchEvent(selectEvent);
        }
    }

    handlePageChange(event) {
        const pageNumber = parseInt(event.currentTarget.dataset.page, 10);
        if (pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
            this.handleSearch();
        }
    }

    handlePrevious() {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.handleSearch();
        }
    }

    handleNext() {
        if (!this.isLastPage) {
            this.currentPage++;
            this.handleSearch();
        }
    }
}