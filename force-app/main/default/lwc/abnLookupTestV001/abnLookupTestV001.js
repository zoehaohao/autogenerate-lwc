import { LightningElement, track } from 'lwc';

export default class AbnLookupTestV001 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    @track name = '';

    handleNameChange(event) {
        this.name = event.target.value;
        // Dispatch name change event
        this.dispatchEvent(new CustomEvent('namechange', {
            detail: {
                value: this.name
            }
        }));
    }

    handleKeyUp(event) {
        this.searchTerm = event.target.value;
        
        // Mock search results for demonstration
        if (this.searchTerm) {
            this.searchResults = [
                { Id: '1', Name: 'Result 1' },
                { Id: '2', Name: 'Result 2' },
                { Id: '3', Name: 'Result 3' }
            ];
        } else {
            this.searchResults = [];
        }
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedResult = this.searchResults.find(result => result.Id === selectedId);
        
        if (selectedResult) {
            this.searchTerm = selectedResult.Name;
            this.searchResults = [];
            
            // Dispatch event with selected result
            this.dispatchEvent(new CustomEvent('selection', {
                detail: selectedResult
            }));
        }
    }
}