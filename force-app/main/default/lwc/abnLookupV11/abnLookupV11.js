import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnLookupV11Controller.search';

export default class AbnLookupV11 extends LightningElement {
    @api label;
    @api placeholder = 'Search...';
    @api required = false;
    @api disabled = false;
    @api objectApiName;
    @api fieldApiName;
    @api iconName = 'standard:account';
    @api filters;
    
    @track searchTerm = '';
    @track records;
    @track selectedRecord;
    @track errorMessage;
    @track isSearching = false;
    @track hasFocus = false;

    get getContainerClass() {
        return `slds-combobox_container ${this.selectedRecord ? 'slds-has-selection' : ''}`;
    }

    get getDropdownClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${this.showDropdown ? 'slds-is-open' : ''}`;
    }

    get getComboboxClass() {
        return `slds-combobox__form-element slds-input-has-icon ${this.selectedRecord ? 'slds-input-has-icon_left-right' : 'slds-input-has-icon_right'}`;
    }

    get showDropdown() {
        return this.hasFocus && !this.selectedRecord && this.records && this.records.length > 0;
    }

    get showNoResults() {
        return this.hasFocus && !this.selectedRecord && (!this.records || this.records.length === 0) && this.searchTerm.length > 0;
    }

    get isExpanded() {
        return this.showDropdown.toString();
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;
        
        if (searchTerm.length >= 2) {
            this.isSearching = true;
            this.performSearch();
        } else {
            this.records = null;
        }
    }

    async performSearch() {
        try {
            this.records = await search({
                objectApiName: this.objectApiName,
                fieldApiName: this.fieldApiName,
                searchTerm: this.searchTerm,
                filters: this.filters
            });
            this.errorMessage = null;
        } catch (error) {
            this.errorMessage = error.message;
            this.records = null;
        } finally {
            this.isSearching = false;
        }
    }

    handleSelect(event) {
        const selectedValue = event.currentTarget.dataset.value;
        const selectedRecord = this.records.find(record => record.value === selectedValue);
        
        if (selectedRecord) {
            this.selectedRecord = selectedRecord;
            this.dispatchEvent(new CustomEvent('select', {
                detail: {
                    value: selectedRecord.value,
                    label: selectedRecord.label
                }
            }));
        }
        this.records = null;
        this.searchTerm = '';
    }

    handleRemove(event) {
        event.preventDefault();
        this.selectedRecord = null;
        this.searchTerm = '';
        this.records = null;
        this.dispatchEvent(new CustomEvent('remove'));
        this.template.querySelector('lightning-input').focus();
    }

    handleFocus() {
        this.hasFocus = true;
        if (this.searchTerm.length >= 2) {
            this.performSearch();
        }
    }

    handleBlur() {
        // Delay hiding the dropdown to allow click events to fire
        setTimeout(() => {
            this.hasFocus = false;
        }, 300);
    }

    @api
    reset() {
        this.selectedRecord = null;
        this.searchTerm = '';
        this.records = null;
        this.errorMessage = null;
    }

    @api
    validate() {
        if (this.required && !this.selectedRecord) {
            this.errorMessage = 'Complete this field.';
            return {
                isValid: false,
                errorMessage: this.errorMessage
            };
        }
        return { isValid: true };
    }
}