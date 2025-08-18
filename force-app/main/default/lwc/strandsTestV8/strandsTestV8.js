import { LightningElement, track } from 'lwc';

export default class StrandsTestV8 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track currentPage = 1;
    @track totalPages = 1;
    @track isLoading = false;

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    async handleSearch() {
        if (!this.searchTerm) return;
        
        this.isLoading = true;
        try {
            // Simulated API call - replace with actual ABN lookup API
            const results = await this.searchABN(this.searchTerm);
            this.searchResults = results.map(result => ({
                ...result,
                abnStatus: result.abnStatus || 'Active',
                entityType: result.entityType || 'Australian Private Company',
                location: result.location || 'VIC 3123'
            }));
        } catch (error) {
            console.error('Error searching ABN:', error);
            // Handle error appropriately
        } finally {
            this.isLoading = false;
        }
    }

    async searchABN(term) {
        // Implement actual ABN lookup API call here
        // This is a mock implementation
        return [
            {
                abn: '45 004 189 708',
                entityName: 'COLES SUPERMARKETS AUSTRALIA PTY LTD',
                abnStatus: 'Active from 14 Feb 2000',
                entityType: 'Australian Private Company',
                location: 'VIC 3123'
            }
        ];
    }

    handleSelect(event) {
        const selectedABN = event.target.dataset.abn;
        // Dispatch event with selected ABN details
        this.dispatchEvent(new CustomEvent('abnselected', {
            detail: {
                abn: selectedABN,
                record: this.searchResults.find(result => result.abn === selectedABN)
            }
        }));
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.handleSearch();
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.handleSearch();
        }
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }
}