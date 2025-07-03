import { LightningElement, track } from 'lwc';

export default class TestUploadCmp extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track showError = false;

    get hasResults() {
        return this.searchResults.length > 0;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.showError = false;
    }

    handleSearch() {
        // Reset error state
        this.showError = false;

        // Validate input
        if (this.isABN(this.searchTerm) || this.isACN(this.searchTerm)) {
            // Mock search results for demonstration
            this.searchResults = [
                {
                    abn: '33 051 775 556',
                    businessName: 'Big Bang Aged Care Limited',
                    status: '(Active)'
                },
                {
                    abn: '004 085 616',
                    businessName: 'Big Bang Aged Care NSW',
                    status: '(Active)'
                },
                {
                    abn: '123 456 789',
                    businessName: 'Big Bang Aged Care QLD',
                    status: '(Active)'
                }
            ];
        } else {
            this.showError = true;
            this.searchResults = [];
        }
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

    isABN(value) {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue.length === 11;
    }

    isACN(value) {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue.length === 9;
    }
}
