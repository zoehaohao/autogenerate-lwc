import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnLookupCmpTestV1Controller.search';

export default class AbnLookupCmpTestV1 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api objectName;
    
    @track searchTerm = '';
    @track results = [];
    @track isExpanded = false;
    @track selectedRecord;

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;
        
        if (searchTerm.length >= 2) {
            search({ 
                searchTerm: this.searchTerm,
                objectName: this.objectName 
            })
            .then(results => {
                this.results = results;
                this.isExpanded = true;
            })
            .catch(error => {
                console.error('Error searching records:', error);
                this.dispatchEvent(
                    new CustomEvent('error', {
                        detail: error
                    })
                );
            });
        } else {
            this.results = [];
            this.isExpanded = false;
        }
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;
        
        this.selectedRecord = {
            id: selectedId,
            name: selectedName
        };
        
        this.searchTerm = selectedName;
        this.isExpanded = false;

        this.dispatchEvent(
            new CustomEvent('select', {
                detail: this.selectedRecord
            })
        );
    }

    handleFocus() {
        if (this.results.length > 0) {
            this.isExpanded = true;
        }
    }

    handleBlur() {
        // Small delay to allow click event to fire before closing dropdown
        setTimeout(() => {
            this.isExpanded = false;
        }, 300);
    }

    @api
    clearSelection() {
        this.searchTerm = '';
        this.selectedRecord = null;
        this.results = [];
        this.isExpanded = false;
    }
}