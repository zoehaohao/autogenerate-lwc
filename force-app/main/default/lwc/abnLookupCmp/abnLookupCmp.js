import { LightningElement, track } from 'lwc';

export default class AbnLookupCmp extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track showError = false;
    @track errorMessage = '';
    @track showResults = false;
    @track showHelperText = true;

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.showError = false;
        this.showResults = false;
        this.showHelperText = true;
    }

    handleSearch() {
        // Reset states
        this.showError = false;
        this.showResults = false;
        this.showHelperText = false;

        // Validate input
        if (!this.searchTerm) {
            this.showError = true;
            this.errorMessage = 'Please enter a search term';
            return;
        }

        // Validate ABN/ACN format if numeric input
        if (/^\d+$/.test(this.searchTerm)) {
            if (this.searchTerm.length !== 11 && this.searchTerm.length !== 9) {
                this.showError = true;
                this.errorMessage = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again.';
                return;
            }
        }

        // Mock search results - replace with actual API call
        this.searchResults = [
            {
                id: '1',
                abn: '33 051 775 556',
                entityName: 'Big Bang Aged Care Limited',
                businessName: 'Big Bang Aged Care Limited (Active)'
            },
            {
                id: '2',
                abn: '004 085 616',
                entityName: 'Big Bang Aged Care NSW',
                businessName: 'Big Bang Aged Care NSW (Active)'
            }
        ];

        this.showResults = true;
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedResult = this.searchResults.find(result => result.id === selectedId);
        
        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: selectedResult
        }));
    }
}
