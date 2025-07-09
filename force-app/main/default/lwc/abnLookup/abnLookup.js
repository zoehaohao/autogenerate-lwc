import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupController.searchABN';

export default class AbnLookup extends LightningElement {
    @api recordId;
    @track searchTerm = '';
    @track searchResults = [];
    @track errorMessage = '';
    @track isLoading = false;

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
        if (this.searchTerm.length < 3) {
            this.searchResults = [];
        }
    }

    async handleSearch() {
        if (!this.searchTerm || this.searchTerm.length < 3) {
            this.errorMessage = 'Please enter at least 3 characters to search';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        try {
            const results = await searchABN({ searchTerm: this.searchTerm });
            this.searchResults = results.map(result => ({
                ...result,
                id: crypto.randomUUID()
            }));
        } catch (error) {
            this.errorMessage = error.body?.message || 'An error occurred while searching. Please try again.';
            this.searchResults = [];
        } finally {
            this.isLoading = false;
        }
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedResult = this.searchResults.find(result => result.id === selectedId);
        
        if (selectedResult) {
            // Dispatch custom event with selected ABN details
            this.dispatchEvent(new CustomEvent('abnselected', {
                detail: {
                    abn: selectedResult.abn,
                    businessName: selectedResult.businessName,
                    status: selectedResult.status
                }
            }));
        }
    }
}
