import { LightningElement, track } from 'lwc';
import search from '@salesforce/apex/testRegenerationV0Controller.search';

export default class TestRegenerationV0 extends LightningElement {
    @track searchTerm = '';
    @track results;
    
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
    }
    
    handleSearch() {
        if (this.searchTerm) {
            search({ searchTerm: this.searchTerm })
                .then(result => {
                    this.results = result;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }
}