import { LightningElement, track } from 'lwc';

export default class AbnLookupCmp extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track showError = false;
    @track errorMessage = '';

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.showError = false;
    }

    handleSearch() {
        // Reset states
        this.showError = false;
        this.searchResults = [];

        // Validate input
        if (!this.searchTerm) {
            this.showError = true;
            this.errorMessage = 'Please enter a search term';
            return;
        }

        // Simulate API call with mock data
        if (this.searchTerm.toLowerCase().includes('big bang')) {
            this.searchResults = [
                {
                    id: '1',
                    abn: '33 051 775 556',
                    entityName: 'Big Bang Aged Care Limited',
                    businessName: 'Big Bang Aged Care Limited',
                    status: '(Active)'
                },
                {
                    id: '2',
                    abn: '004 085 616',
                    entityName: 'Big Bang Aged Care NSW',
                    businessName: 'Big Bang Aged Care NSW',
                    status: '(Active)'
                },
                {
                    id: '3',
                    abn: '123 456 789',
                    entityName: 'Big Bang Aged Care QLD',
                    businessName: 'Big Bang Aged Care QLD',
                    status: '(Active)'
                }
            ];
        } else {
            // Validate ABN/ACN format
            if (this.isNumeric(this.searchTerm)) {
                const digits = this.searchTerm.replace(/\D/g, '').length;
                if (digits !== 9 && digits !== 11) {
                    this.showError = true;
                    this.errorMessage = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again.';
                    return;
                }
            }
        }
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedResult = this.searchResults.find(result => result.id === selectedId);
        
        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: selectedResult
        }));
    }

    isNumeric(str) {
        return /^\d+$/.test(str.replace(/\D/g, ''));
    }
}
