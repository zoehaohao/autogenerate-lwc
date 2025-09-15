import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const DELAY = 300; // Debounce delay in milliseconds
const MIN_SEARCH_CHARS = 2; // Minimum characters before search

export default class AbnLookupTestV0 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api iconName = 'standard:account';
    @api required = false;
    @api messageWhenInvalid = 'Please select a valid option';

    searchTerm = '';
    isLoading = false;
    hasError = false;
    errorMessage = '';
    results = [];
    selectedId = '';
    selectedValue = '';
    delayTimeout;

    get isExpanded() {
        return this.results.length > 0 && this.hasFocus;
    }

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }

    get noResults() {
        return !this.isLoading && this.results.length === 0 && this.searchTerm.length >= MIN_SEARCH_CHARS;
    }

    hasFocus = false;

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        // Clear any existing timeout
        clearTimeout(this.delayTimeout);

        // Reset results if search term is cleared
        if (!searchTerm) {
            this.results = [];
            return;
        }

        // Don't search until minimum characters are entered
        if (searchTerm.length < MIN_SEARCH_CHARS) {
            return;
        }

        // Set a new timeout for the search
        this.delayTimeout = setTimeout(() => {
            this.performSearch(searchTerm);
        }, DELAY);
    }

    async performSearch(searchTerm) {
        try {
            this.isLoading = true;
            this.hasError = false;

            // Mock search results - replace with actual API call
            this.results = [
                { id: '1', value: 'Option 1', label: 'Option 1', sublabel: 'Description 1' },
                { id: '2', value: 'Option 2', label: 'Option 2', sublabel: 'Description 2' },
                { id: '3', value: 'Option 3', label: 'Option 3', sublabel: 'Description 3' }
            ];
        } catch (error) {
            this.hasError = true;
            this.errorMessage = error.message || 'An error occurred while searching';
            this.dispatchToast('Error', this.errorMessage, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedValue = event.currentTarget.dataset.value;
        
        this.selectedId = selectedId;
        this.selectedValue = selectedValue;
        this.searchTerm = selectedValue;
        this.results = [];

        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                id: selectedId,
                value: selectedValue
            }
        }));
    }

    handleFocus() {
        this.hasFocus = true;
        if (this.searchTerm.length >= MIN_SEARCH_CHARS) {
            this.performSearch(this.searchTerm);
        }
    }

    handleBlur() {
        // Delay closing to allow click events to fire
        setTimeout(() => {
            this.hasFocus = false;
        }, 300);
    }

    @api
    validate() {
        if (!this.required) return { isValid: true };
        const isValid = !!this.selectedId;
        if (!isValid) {
            this.hasError = true;
            this.errorMessage = this.messageWhenInvalid;
        }
        return { isValid, errorMessage: this.messageWhenInvalid };
    }

    dispatchToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

    @api
    reset() {
        this.searchTerm = '';
        this.selectedId = '';
        this.selectedValue = '';
        this.results = [];
        this.hasError = false;
        this.errorMessage = '';
    }
}