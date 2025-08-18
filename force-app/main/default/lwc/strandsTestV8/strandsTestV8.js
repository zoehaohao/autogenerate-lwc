// strandsTestV8.js
import { LightningElement, track } from 'lwc';

export default class StrandsTestV8 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = null;

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    handleSearch() {
        // Simulated search results based on Coles example
        if (this.searchTerm.toLowerCase().includes('coles')) {
            this.searchResults = [{
                abn: '45 004 189 708',
                entityName: 'COLES SUPERMARKETS AUSTRALIA PTY LTD',
                entityType: 'Australian Private Company',
                abnStatus: 'Active from 14 Feb 2000',
                gstStatus: 'Registered from 01 Jul 2000',
                location: 'VIC 3123'
            }];
        } else {
            this.searchResults = [];
        }
    }

    handleSelect(event) {
        const selectedAbn = event.currentTarget.dataset.abn;
        // Dispatch event with selected ABN
        this.dispatchEvent(new CustomEvent('abnselected', {
            detail: selectedAbn
        }));
    }
}