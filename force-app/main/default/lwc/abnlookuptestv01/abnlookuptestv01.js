import { LightningElement, api, track } from 'lwc';
import search from '@salesforce/apex/abnlookuptestv01Controller.search';

const MINIMAL_SEARCH_TERM_LENGTH = 2;
const SEARCH_DELAY = 300;

export default class Abnlookuptestv01 extends LightningElement {
    @api label = '';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api objectApiName = 'Account';
    @api fields = ['Name'];
    @api whereClause = '';
    @api required = false;
    @api disabled = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track loading = false;
    @track errorMessage = '';
    @track selectedRecord;

    searchTimeoutId;
    blurTimeoutId;
    showDropdown = false;

    @api
    get selectedValue() {
        return this.selectedRecord ? this.selectedRecord.title : '';
    }

    @api
    get selectedRecordId() {
        return this.selectedRecord ? this.selectedRecord.id : '';
    }

    get hasResults() {
        return this.searchResults.length > 0;
    }

    get isValueSelected() {
        return this.selectedRecord != null;
    }

    get getContainerClass() {
        let css = 'slds-combobox_container ';
        if (this.showDropdown) {
            css += 'slds-is-open';
        }
        return css;
    }

    get selectedIconName() {
        return this.iconName || 'standard:account';
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        if (this.searchTimeoutId) {
            clearTimeout(this.searchTimeoutId);
        }

        if (searchTerm.length < MINIMAL_SEARCH_TERM_LENGTH) {
            this.searchResults = [];
            this.showDropdown = false;
            return;
        }

        this.searchTimeoutId = setTimeout(() => {
            this.loading = true;
            this.performSearch();
        }, SEARCH_DELAY);
    }

    handleFocus() {
        if (this.blurTimeoutId) {
            clearTimeout(this.blurTimeoutId);
        }
        if (this.searchTerm.length >= MINIMAL_SEARCH_TERM_LENGTH) {
            this.showDropdown = true;
        }
    }

    handleBlur() {
        this.blurTimeoutId = setTimeout(() => {
            this.showDropdown = false;
        }, 300);
    }

    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.id;
        const recordName = event.currentTarget.dataset.name;

        this.selectedRecord = {
            id: recordId,
            title: recordName
        };

        this.showDropdown = false;
        this.dispatchSelectionChangeEvent();
    }

    handleClearSelection() {
        this.selectedRecord = null;
        this.searchTerm = '';
        this.searchResults = [];
        this.dispatchSelectionChangeEvent();
    }

    async performSearch() {
        try {
            const results = await search({
                objectApiName: this.objectApiName,
                fields: this.fields,
                searchTerm: this.searchTerm,
                whereClause: this.whereClause
            });

            this.searchResults = results.map(record => ({
                id: record.Id,
                title: record[this.fields[0]],
                subtitle: this.fields.length > 1 ? record[this.fields[1]] : null
            }));

            this.showDropdown = true;
            this.errorMessage = '';
        } catch (error) {
            this.errorMessage = error.message || 'An error occurred while searching.';
            this.searchResults = [];
        } finally {
            this.loading = false;
        }
    }

    dispatchSelectionChangeEvent() {
        const event = new CustomEvent('selectionchange', {
            detail: {
                recordId: this.selectedRecordId,
                value: this.selectedValue,
                record: this.selectedRecord
            }
        });
        this.dispatchEvent(event);
    }

    @api
    validate() {
        if (this.required && !this.selectedRecordId) {
            this.errorMessage = 'Please select a value';
            return {
                isValid: false,
                errorMessage: this.errorMessage
            };
        }
        this.errorMessage = '';
        return { isValid: true };
    }
}