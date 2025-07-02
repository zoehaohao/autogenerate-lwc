import { LightningElement, track } from 'lwc';

export default class AbnLookupCmp extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track showError = false;

    // Mock data for demonstration
    mockResults = [
        { abn: '33 051 775 556', businessName: 'Big Bang Aged Care Limited', status: 'Active' },
        { abn: '004 085 616', businessName: 'Big Bang Aged Care NSW', status: 'Active' },
        { abn: '123 456 789', businessName: 'Big Bang Aged Care QLD', status: 'Active' },
        { abn: '456 789 123', businessName: 'Big Bang Aged Care VIC', status: 'Active' }
    ];

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.showError = false;
    }

    handleSearch() {
        // Reset error state
        this.showError = false;

        // Validate search term
        if (this.isABNSearch() && !this.isValidABN(this.searchTerm)) {
            this.showError = true;
            this.searchResults = [];
            return;
        }

        // Perform search (mock implementation)
        this.searchResults = this.mockResults.filter(result => {
            return result.businessName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                   result.abn.includes(this.searchTerm);
        });
    }

    handleSelect(event) {
        const selectedAbn = event.currentTarget.dataset.id;
        // Dispatch event with selected ABN
        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                abn: selectedAbn
            }
        }));
    }

    isABNSearch() {
        return /^\d+$/.test(this.searchTerm);
    }

    isValidABN(abn) {
        const digits = abn.replace(/\D/g, '');
        return digits.length === 11;
    }
}
