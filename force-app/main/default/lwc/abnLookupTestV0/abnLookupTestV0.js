import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/abnLookupTestV0Controller.searchRecords';

export default class AbnLookupTestV0 extends LightningElement {
    @api objectApiName = 'Account';
    @api searchFields = ['Name', 'AccountNumber'];
    @api titleField = 'Name';
    @api subtitleField = 'AccountNumber';
    @api iconName = 'standard:account';
    @api label = 'Search';
    @api required = false;
    @api placeholder = 'Search...';
    @api messageWhenInvalidSelection = 'Please select a valid option';

    @track searchTerm = '';
    @track results = [];
    @track selectedId;
    @track selectedTitle;
    @track isLoading = false;
    @track error;

    blurTimeout;

    get hasSelection() {
        return this.selectedId != null;
    }

    get showResults() {
        return this.searchTerm && this.hasFocus && !this.hasSelection;
    }

    get showNoResults() {
        return this.results.length === 0 && !this.isLoading;
    }

    get hasError() {
        return this.error != null;
    }

    get getContainerClass() {
        let css = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        if (this.hasFocus && !this.hasSelection) {
            css += ' slds-is-open';
        }
        return css;
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
        
        // Don't search if the string is too short
        if (this.searchTerm.length < 2) {
            this.results = [];
            return;
        }

        // Show loading spinner
        this.isLoading = true;
        
        // Call Apex method
        searchRecords({
            objectApiName: this.objectApiName,
            searchTerm: this.searchTerm,
            searchFields: this.searchFields,
            titleField: this.titleField,
            subtitleField: this.subtitleField
        })
        .then(results => {
            this.results = results.map(record => ({
                id: record.Id,
                title: record[this.titleField],
                subtitle: record[this.subtitleField],
                icon: this.iconName
            }));
            this.error = null;
        })
        .catch(error => {
            this.error = error.message || 'Unknown error';
            this.results = [];
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.id;
        const result = this.results.find(r => r.id === recordId);
        if (result) {
            this.selectedId = result.id;
            this.selectedTitle = result.title;
            this.searchTerm = '';
            this.results = [];
            
            // Dispatch selection event
            this.dispatchEvent(new CustomEvent('select', {
                detail: {
                    recordId: result.id,
                    record: result
                }
            }));
        }
    }

    handleClearSelection() {
        this.selectedId = null;
        this.selectedTitle = null;
        this.searchTerm = '';
        this.results = [];
        
        // Dispatch clear event
        this.dispatchEvent(new CustomEvent('clear'));
    }

    @api
    validate() {
        if (this.required && !this.hasSelection) {
            return {
                isValid: false,
                errorMessage: this.messageWhenInvalidSelection
            };
        }
        return { isValid: true };
    }

    handleFocus() {
        this.hasFocus = true;
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
    }

    handleBlur() {
        // Delay hiding the results to allow click events to fire
        this.blurTimeout = setTimeout(() => {
            this.hasFocus = false;
        }, 300);
    }

    @api
    reset() {
        this.handleClearSelection();
    }
}