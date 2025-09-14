import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnLookupTestV0Controller.search';

export default class AbnLookupTestV0 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api required = false;
    @api objectApiName;
    @api fieldApiName;
    
    @track searchTerm = '';
    @track results = [];
    @track isExpanded = false;
    @track selectedItem = null;

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }

    get listboxClass() {
        return `slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid ${
            this.isExpanded ? 'slds-show' : 'slds-hide'
        }`;
    }

    get noResults() {
        return this.isExpanded && this.results.length === 0;
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;
        
        if (searchTerm.length >= 2) {
            search({ 
                searchTerm: searchTerm,
                objectApiName: this.objectApiName,
                fieldApiName: this.fieldApiName
            })
            .then(result => {
                this.results = result;
                this.isExpanded = true;
            })
            .catch(error => {
                console.error('Error performing search:', error);
                this.dispatchEvent(
                    new CustomEvent('error', {
                        detail: {
                            error: error.body.message
                        }
                    })
                );
            });
        } else {
            this.results = [];
            this.isExpanded = false;
        }
    }

    handleFocus() {
        this.isExpanded = true;
    }

    handleBlur(event) {
        // Add delay to allow click events to fire on results
        setTimeout(() => {
            this.isExpanded = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selected = this.results.find(result => result.id === selectedId);
        
        if (selected) {
            this.selectedItem = selected;
            this.searchTerm = selected.name;
            this.isExpanded = false;
            
            this.dispatchEvent(
                new CustomEvent('select', {
                    detail: {
                        selectedItem: selected
                    }
                })
            );
        }
    }

    @api
    clearSelection() {
        this.searchTerm = '';
        this.selectedItem = null;
        this.results = [];
        this.isExpanded = false;
    }
}