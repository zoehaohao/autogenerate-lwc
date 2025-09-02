import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnLookupV10Controller.search';

const DELAY = 300;

export default class AbnLookupV10 extends LightningElement {
    @api label;
    @api placeholder = 'Search...';
    @api objectApiName;
    @api objectIconName = 'standard:default';
    @api objectLabel = 'Record';
    @api required = false;
    @api fields = ['Name'];
    @api whereClause = '';
    @api searchFields = ['Name'];
    @api subtitleField;
    @api limit = 5;

    @api
    get selectedValue() {
        return this._selectedValue;
    }
    set selectedValue(value) {
        this._selectedValue = value;
        if (value) {
            this.searchTerm = this.selectedLabel;
        } else {
            this.searchTerm = '';
        }
    }

    @api
    get selectedLabel() {
        return this._selectedLabel;
    }
    set selectedLabel(value) {
        this._selectedLabel = value;
    }

    @track searchTerm = '';
    @track results = [];
    @track loading = false;
    @track errorMessage;

    _selectedValue;
    _selectedLabel;
    _timeout;
    _hasFocus = false;

    get showDropdown() {
        return this._hasFocus && (this.loading || this.results.length > 0);
    }

    get hasResults() {
        return this.results.length > 0;
    }

    get isExpanded() {
        return this.showDropdown;
    }

    get isInputReadonly() {
        return false;
    }

    get getContainerClass() {
        return `slds-combobox_container ${this.selectedValue ? 'slds-has-selection' : ''}`;
    }

    get getComboboxClass() {
        let css = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        if (this.showDropdown) {
            css += ' slds-is-open';
        }
        return css;
    }

    get getInputClass() {
        return `slds-input slds-combobox__input ${this.selectedValue ? 'slds-combobox__input-value' : ''}`;
    }

    get getIconName() {
        return this.loading ? 'utility:spinner' : 'utility:search';
    }

    get getIconClass() {
        return `slds-input__icon ${this.loading ? 'slds-spinner slds-spinner_brand slds-spinner_x-small' : ''}`;
    }

    get getItemClass() {
        return 'slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta';
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        if (this._timeout) {
            clearTimeout(this._timeout);
        }

        if (searchTerm.length >= 2) {
            this._timeout = setTimeout(() => {
                this.loading = true;
                this.search();
            }, DELAY);
        } else {
            this.results = [];
        }
    }

    handleChange(event) {
        this.searchTerm = event.target.value;
    }

    handleFocus() {
        this._hasFocus = true;
        if (this.searchTerm.length >= 2) {
            this.search();
        }
    }

    handleBlur() {
        setTimeout(() => {
            this._hasFocus = false;
        }, 300);
    }

    handleIconClick() {
        if (this.selectedValue) {
            this.handleRemove();
        }
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedResult = this.results.find(result => result.id === selectedId);
        
        if (selectedResult) {
            this._selectedValue = selectedResult.id;
            this._selectedLabel = selectedResult.title;
            this.searchTerm = selectedResult.title;
            
            this.dispatchEvent(new CustomEvent('select', {
                detail: {
                    value: selectedResult.id,
                    label: selectedResult.title,
                    record: selectedResult.record
                }
            }));
        }
        
        this.results = [];
    }

    handleRemove() {
        this._selectedValue = null;
        this._selectedLabel = null;
        this.searchTerm = '';
        this.results = [];
        
        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                value: null,
                label: null,
                record: null
            }
        }));

        setTimeout(() => {
            this.template.querySelector('input').focus();
        }, 0);
    }

    async search() {
        try {
            const searchResults = await search({
                objectApiName: this.objectApiName,
                searchTerm: this.searchTerm,
                fields: this.fields,
                searchFields: this.searchFields,
                subtitleField: this.subtitleField,
                whereClause: this.whereClause,
                limitSize: this.limit
            });

            this.results = searchResults.map(record => ({
                id: record.Id,
                title: record[this.fields[0]],
                subtitle: this.subtitleField ? record[this.subtitleField] : null,
                record: record
            }));

            this.errorMessage = null;
        } catch (error) {
            this.errorMessage = error.message || 'An error occurred while searching.';
            this.results = [];
        } finally {
            this.loading = false;
        }
    }

    @api
    validate() {
        if (this.required && !this.selectedValue) {
            this.errorMessage = `Please select a ${this.objectLabel}.`;
            return {
                isValid: false,
                errorMessage: this.errorMessage
            };
        }
        
        this.errorMessage = null;
        return {
            isValid: true,
            errorMessage: null
        };
    }

    @api
    reset() {
        this.handleRemove();
        this.errorMessage = null;
    }
}