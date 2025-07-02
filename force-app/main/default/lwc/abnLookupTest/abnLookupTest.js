import { LightningElement, track } from 'lwc';

export default class AbnLookupTest extends LightningElement {
    @track showSearchSection = false;
    @track searchTerm = '';
    @track errorMessages = [];
    @track searchResults = [];
    @track showResults = false;

    handleFindABN() {
        this.showSearchSection = true;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessages = [];
        this.showResults = false;
    }

    handleSearch() {
        this.errorMessages = [];
        this.searchResults = [];
        
        if (!this.searchTerm) {
            return;
        }

        // Simulate ABN validation
        if (this.searchTerm.match(/^\d+$/)) {
            if (this.searchTerm.length !== 11) {
                this.errorMessages.push('An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again.');
                this.errorMessages.push(`No results, for ${this.searchTerm}, check the number and try again.`);
            }
        } else {
            // Simulate business name search
            if (this.searchTerm.toLowerCase().includes('big bang')) {
                this.searchResults = [
                    {
                        id: '1',
                        name: 'Big Bang Aged Care Limited (Active)',
                        fields: [
                            { label: 'Field label', value: 'Response or selection' },
                            { label: 'Field label', value: 'Response or selection' },
                            { label: 'Field label', value: 'Response or selection' }
                        ]
                    },
                    {
                        id: '2',
                        name: 'Big Bang Aged Care NSW (Active)',
                        fields: [
                            { label: 'Field label', value: 'Response or selection' },
                            { label: 'Field label', value: 'Response or selection' },
                            { label: 'Field label', value: 'Response or selection' }
                        ]
                    }
                ];
            } else {
                this.errorMessages.push(`No results found matching, ${this.searchTerm}.`);
            }
        }

        this.showResults = true;
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        // Handle selection logic here
        console.log('Selected ID:', selectedId);
    }
}
