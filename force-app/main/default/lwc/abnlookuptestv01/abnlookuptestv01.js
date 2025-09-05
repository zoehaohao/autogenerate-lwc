import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnlookuptestv01Controller.search';

export default class Abnlookuptestv01 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api objectApiName = 'Account';
    @api searchField = 'Name';
    @api minSearchLength = 2;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track isExpanded = false;
    
    get showResults() {
        return this.searchResults.length > 0 && this.isExpanded;
    }
    
    get getComboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }
    
    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;
        
        if (searchTerm.length >= this.minSearchLength) {
            search({ 
                searchTerm: searchTerm,
                objectApiName: this.objectApiName,
                searchField: this.searchField
            })
            .then(results => {
                this.searchResults = results;
                this.isExpanded = true;
            })
            .catch(error => {
                console.error('Error performing search:', error);
                this.searchResults = [];
                this.isExpanded = false;
            });
        } else {
            this.searchResults = [];
            this.isExpanded = false;
        }
    }
    
    handleFocus() {
        if (this.searchResults.length > 0) {
            this.isExpanded = true;
        }
    }
    
    handleBlur() {
        // Using setTimeout to allow click events to fire before closing
        setTimeout(() => {
            this.isExpanded = false;
        }, 300);
    }
    
    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;
        
        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: {
                id: selectedId,
                name: selectedName
            }
        }));
        
        this.searchTerm = selectedName;
        this.isExpanded = false;
    }
}