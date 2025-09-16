import { LightningElement, api } from 'lwc';

export default class AbnLookupCmpTestV1 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api required = false;
    @api messageWhenInvalid = 'Complete this field.';

    searchTerm = '';
    selectedRecord = null;
    isSearching = false;
    searchResults = [];
    showResults = false;

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${this.showResults ? 'slds-is-open' : ''}`;
    }

    get listboxClass() {
        return `slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid ${this.showResults ? 'slds-show' : 'slds-hide'}`;
    }

    get noResults() {
        return !this.isSearching && this.searchResults.length === 0 && this.searchTerm;
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;
        
        if (searchTerm.length >= 2) {
            this.performSearch(searchTerm);
        } else {
            this.searchResults = [];
        }
    }

    handleFocus() {
        this.showResults = true;
    }

    handleBlur() {
        // Using setTimeout to allow click events to fire before closing
        setTimeout(() => {
            this.showResults = false;
        }, 300);
    }

    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.recordid;
        const selectedRecord = this.searchResults.find(result => result.id === recordId);
        
        if (selectedRecord) {
            this.selectedRecord = selectedRecord;
            this.searchTerm = '';
            this.searchResults = [];
            this.showResults = false;
            this.dispatchEvent(new CustomEvent('recordselected', {
                detail: selectedRecord
            }));
        }
    }

    handleRemoveSelected() {
        this.selectedRecord = null;
        this.searchTerm = '';
        this.dispatchEvent(new CustomEvent('recordremoved'));
    }

    async performSearch(searchTerm) {
        this.isSearching = true;
        
        try {
            // Mock search results - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.searchResults = [
                { id: '1', title: 'Sample Account 1', subtitle: 'Account • Sample Industry' },
                { id: '2', title: 'Sample Account 2', subtitle: 'Account • Sample Industry' }
            ];
        } catch (error) {
            console.error('Search error:', error);
            this.searchResults = [];
        } finally {
            this.isSearching = false;
        }
    }

    @api
    validate() {
        if (this.required && !this.selectedRecord) {
            return {
                isValid: false,
                errorMessage: this.messageWhenInvalid
            };
        }
        return { isValid: true };
    }

    @api
    reset() {
        this.selectedRecord = null;
        this.searchTerm = '';
        this.searchResults = [];
        this.showResults = false;
    }
}