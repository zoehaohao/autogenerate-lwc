import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnLookupTestV0Controller.search';

const DELAY = 300;

export default class AbnLookupTestV0 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api objectApiName;
    @api searchFields = ['Name'];
    @api required = false;
    @api disabled = false;

    @track searchTerm = '';
    @track results = [];
    @track selectedItem = null;
    @track loading = false;
    @track error = null;

    searchTimeout;
    hasFocus = false;

    get hasError() {
        return this.error !== null;
    }

    get errorMessage() {
        return this.error;
    }

    get isExpanded() {
        return this.hasFocus && (this.results.length > 0 || this.loading || this.noResults);
    }

    get noResults() {
        return !this.loading && this.results.length === 0 && this.searchTerm.length > 0;
    }

    get getContainerClass() {
        return `slds-combobox_container ${this.selectedItem ? 'slds-has-selection' : ''}`;
    }

    get getComboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${this.isExpanded ? 'slds-is-open' : ''}`;
    }

    get getInputClass() {
        const baseClass = 'slds-input slds-combobox__input';
        return this.hasError 
            ? `${baseClass} slds-has-error`
            : baseClass;
    }

    get getListboxClass() {
        return `slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid`;
    }

    get getItemClass() {
        return `slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta`;
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (searchTerm.length >= 2) {
            this.searchTimeout = setTimeout(() => {
                this.performSearch();
            }, DELAY);
        } else {
            this.results = [];
        }
    }

    handleChange(event) {
        this.searchTerm = event.target.value;
    }

    handleFocus() {
        this.hasFocus = true;
        if (this.searchTerm.length >= 2) {
            this.performSearch();
        }
    }

    handleBlur() {
        setTimeout(() => {
            this.hasFocus = false;
        }, 300);
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedItem = this.results.find(result => result.id === selectedId);
        
        if (selectedItem) {
            this.selectedItem = selectedItem;
            this.searchTerm = selectedItem.title;
            this.results = [];
            
            this.dispatchEvent(new CustomEvent('select', {
                detail: {
                    id: selectedItem.id,
                    title: selectedItem.title,
                    subtitle: selectedItem.subtitle
                }
            }));
        }
    }

    async performSearch() {
        if (!this.objectApiName) {
            this.error = 'Object API Name is required';
            return;
        }

        this.loading = true;
        this.error = null;

        try {
            const searchResults = await search({
                objectApiName: this.objectApiName,
                searchTerm: this.searchTerm,
                searchFields: this.searchFields
            });

            this.results = searchResults.map(record => ({
                id: record.Id,
                title: record.Name,
                subtitle: record.Type || ''
            }));
        } catch (error) {
            this.error = error.message || 'An error occurred while searching';
            this.results = [];
        } finally {
            this.loading = false;
        }
    }

    @api
    clearSelection() {
        this.selectedItem = null;
        this.searchTerm = '';
        this.results = [];
    }

    @api
    validate() {
        if (this.required && !this.selectedItem) {
            this.error = 'Please select a value';
            return false;
        }
        this.error = null;
        return true;
    }
}