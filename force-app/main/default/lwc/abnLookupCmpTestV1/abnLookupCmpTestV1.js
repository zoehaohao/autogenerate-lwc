import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnLookupCmpTestV1Controller.search';

const DELAY = 300; // Debounce delay in milliseconds

export default class AbnLookupCmpTestV1 extends LightningElement {
    // Public properties
    @api label;
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api objectApiName;
    @api searchFields = ['Name'];
    @api subtitleField;
    @api required = false;
    @api disabled = false;
    @api messageWhenInvalid = 'Complete this field.';

    // Private properties
    @track searchTerm = '';
    @track results = [];
    @track selection = null;
    @track errorMessage = '';
    @track isLoading = false;
    @track hasFocus = false;

    // Private variables
    _delayTimeout;

    // Computed properties
    get hasResults() {
        return this.results.length > 0;
    }

    get hasSelection() {
        return this.selection != null;
    }

    get showResults() {
        return this.hasFocus && !this.hasSelection && this.searchTerm.length > 0;
    }

    get getContainerClass() {
        let css = 'slds-combobox_container';
        if (this.hasSelection) {
            css += ' slds-has-selection';
        }
        return css;
    }

    get getDropdownClass() {
        let css = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        if (this.showResults) {
            css += ' slds-is-open';
        }
        return css;
    }

    get getInputClass() {
        let css = 'slds-input slds-combobox__input';
        if (this.hasSelection) {
            css += ' slds-combobox__input-value';
        }
        return css;
    }

    // Event handlers
    handleKeyUp(event) {
        // Clear any previous timeouts
        window.clearTimeout(this._delayTimeout);

        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        // Clear selection when input changes
        if (this.hasSelection) {
            this.selection = null;
        }

        // Don't search on empty string
        if (searchTerm.length === 0) {
            this.results = [];
            return;
        }

        // Debounce the search
        this._delayTimeout = setTimeout(() => {
            this.performSearch();
        }, DELAY);
    }

    handleFocus() {
        this.hasFocus = true;
        // Dispatch focus event
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleBlur() {
        // Delay hiding results to allow click events to fire
        setTimeout(() => {
            this.hasFocus = false;
            this.validateInput();
        }, 300);
        // Dispatch blur event
        this.dispatchEvent(new CustomEvent('blur'));
    }

    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.recordid;
        const selected = this.results.find(result => result.id === recordId);
        
        if (selected) {
            this.selection = selected;
            this.searchTerm = selected.title;
            this.results = [];
            this.errorMessage = '';

            // Notify parent component
            this.dispatchEvent(new CustomEvent('select', {
                detail: {
                    recordId: selected.id,
                    record: selected
                }
            }));
        }
    }

    handleRemoveSelection() {
        this.selection = null;
        this.searchTerm = '';
        this.results = [];
        
        // Notify parent component
        this.dispatchEvent(new CustomEvent('clear'));

        // Focus the input after clearing
        this.template.querySelector('input').focus();
    }

    // Helper methods
    async performSearch() {
        if (!this.objectApiName) {
            console.error('objectApiName is required');
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        try {
            const searchResults = await search({
                objectApiName: this.objectApiName,
                searchTerm: this.searchTerm,
                searchFields: this.searchFields,
                subtitleField: this.subtitleField
            });

            this.results = searchResults.map(record => ({
                id: record.Id,
                title: this.getFieldValue(record, this.searchFields[0]),
                subtitle: this.subtitleField ? this.getFieldValue(record, this.subtitleField) : null
            }));
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An error occurred while searching. Please try again.';
            this.results = [];
        } finally {
            this.isLoading = false;
        }
    }

    getFieldValue(record, field) {
        const fields = field.split('.');
        let value = record;
        for (const field of fields) {
            value = value[field];
            if (value == null) break;
        }
        return value;
    }

    validateInput() {
        if (this.required && !this.hasSelection) {
            this.errorMessage = this.messageWhenInvalid;
            return false;
        }
        this.errorMessage = '';
        return true;
    }

    // Public methods
    @api
    validate() {
        return {
            isValid: this.validateInput(),
            errorMessage: this.errorMessage
        };
    }

    @api
    setSelection(record) {
        if (record) {
            this.selection = {
                id: record.Id,
                title: this.getFieldValue(record, this.searchFields[0]),
                subtitle: this.subtitleField ? this.getFieldValue(record, this.subtitleField) : null
            };
            this.searchTerm = this.selection.title;
        } else {
            this.selection = null;
            this.searchTerm = '';
        }
    }
}