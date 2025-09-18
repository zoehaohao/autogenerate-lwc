import { LightningElement, track } from 'lwc';
import findRecords from '@salesforce/apex/AbnLookupCmpTestV1Controller.findRecords';

export default class AbnLookupCmpTestV1 extends LightningElement {
    @track searchTerm = '';
    @track searchResults = [];
    
    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;
        
        if (searchTerm.length >= 2) {
            findRecords({ searchTerm })
                .then(results => {
                    this.searchResults = results;
                    this.toggleDropdown(true);
                })
                .catch(error => {
                    console.error('Error searching records:', error);
                });
        } else {
            this.searchResults = [];
            this.toggleDropdown(false);
        }
    }

    handleClick() {
        if (this.searchResults.length > 0) {
            this.toggleDropdown(true);
        }
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;
        
        // Dispatch custom event with selected record details
        const selectedEvent = new CustomEvent('recordselected', {
            detail: {
                recordId: selectedId,
                recordName: selectedName
            }
        });
        this.dispatchEvent(selectedEvent);
        
        this.searchTerm = selectedName;
        this.toggleDropdown(false);
    }

    toggleDropdown(show) {
        const dropdown = this.template.querySelector('.slds-dropdown-trigger');
        if (dropdown) {
            dropdown.classList.toggle('slds-is-open', show);
        }
    }
}