import { LightningElement, api, track } from 'lwc';

export default class AbnLookupCmpTestV1 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    
    @track searchTerm = '';
    @track results = [];
    @track showResults = false;
    
    // Sample data - replace with actual data source
    sampleData = [
        { id: '1', value: 'Item 1', label: 'Item One', sublabel: 'Description 1', icon: 'standard:account' },
        { id: '2', value: 'Item 2', label: 'Item Two', sublabel: 'Description 2', icon: 'standard:account' },
        { id: '3', value: 'Item 3', label: 'Item Three', sublabel: 'Description 3', icon: 'standard:account' }
    ];
    
    handleSearch(event) {
        this.searchTerm = event.target.value;
        
        if (this.searchTerm.length >= 2) {
            // Filter sample data based on search term
            this.results = this.sampleData.filter(item =>
                item.label.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
            this.showResults = true;
        } else {
            this.results = [];
            this.showResults = false;
        }
    }
    
    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedValue = event.currentTarget.dataset.value;
        
        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: {
                id: selectedId,
                value: selectedValue
            }
        }));
        
        // Clear search and results
        this.searchTerm = '';
        this.results = [];
        this.showResults = false;
    }
}