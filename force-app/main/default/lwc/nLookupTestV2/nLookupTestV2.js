import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/nLookupTestV2Controller.searchABN';

export default class NLookupTestV2 extends LightningElement {
    @api recordId;
    @track searchTerm = '';
    @track results = [];
    @track errorMessage = '';
    @track isLoading = false;
    @track currentPage = 1;
    @track pageSize = 10;
    @track totalRecords = 0;

    get searchPlaceholder() {
        return 'Search by Business name, ABN or ACN';
    }

    get buttonLabel() {
        return this.isNumeric(this.searchTerm) ? 'Verify' : 'Search';
    }

    get displayedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.results.slice(start, end);
    }

    get startRecord() {
        return this.results.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    }

    get endRecord() {
        return Math.min(this.currentPage * this.pageSize, this.totalRecords);
    }

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get pageNumbers() {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    get isPreviousDisabled() {
        return this.currentPage <= 1;
    }

    get isNextDisabled() {
        return this.currentPage >= this.totalPages;
    }

    get pageSizeOptions() {
        return [
            { label: '10', value: 10 },
            { label: '20', value: 20 },
            { label: '50', value: 50 }
        ];
    }

    getPageButtonVariant(pageNumber) {
        return pageNumber === this.currentPage ? 'brand' : 'neutral';
    }

    isNumeric(value) {
        return /^\d+$/.test(value);
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    async handleSearch() {
        if (!this.validateSearch()) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        try {
            const result = await searchABN({ searchTerm: this.searchTerm });
            if (result.success) {
                this.results = result.data;
                this.totalRecords = result.data.length;
                this.currentPage = 1;
            } else {
                this.errorMessage = result.message;
                this.results = [];
            }
        } catch (error) {
            this.errorMessage = 'An error occurred while searching. Please try again.';
            this.results = [];
        } finally {
            this.isLoading = false;
        }
    }

    validateSearch() {
        if (!this.searchTerm || this.searchTerm.trim().length < 2) {
            this.errorMessage = 'Please enter at least 2 characters';
            return false;
        }
        return true;
    }

    handlePageChange(pageNumber) {
        this.currentPage = pageNumber;
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

    handlePageSizeChange(event) {
        this.pageSize = parseInt(event.detail.value, 10);
        this.currentPage = 1;
    }

    handleSelect(result) {
        const selectEvent = new CustomEvent('select', {
            detail: result
        });
        this.dispatchEvent(selectEvent);
    }
}
