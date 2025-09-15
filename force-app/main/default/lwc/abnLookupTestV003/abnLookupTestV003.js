import { LightningElement, track } from 'lwc';
import searchAccounts from '@salesforce/apex/AccountSearchController.searchAccounts';

export default class AbnLookupTestV003 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    
    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;
        
        if (searchTerm.length >= 2) {
            searchAccounts({ searchTerm: searchTerm })
                .then(results => {
                    this.searchResults = results;
                })
                .catch(error => {
                    console.error('Error searching accounts:', error);
                });
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
            
            // Dispatch custom event with selected record
            const selectEvent = new CustomEvent('select', {
                detail: selectedResult
            });
            this.dispatchEvent(selectEvent);
        }
    }
}