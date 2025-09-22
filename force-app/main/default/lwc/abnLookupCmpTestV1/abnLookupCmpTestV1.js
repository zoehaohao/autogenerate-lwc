import { LightningElement, api, track } from 'lwc';

export default class AbnLookupCmpTestV1 extends LightningElement {
    // Public properties
    @api label = '';
    @api placeholder = 'Search...';
    @api required = false;
    @api iconName = 'standard:account';
    @api disabled = false;
    @api minSearchTermLength = 2;
    @api debounceDelay = 300;

    // Private reactive properties
    @track searchTerm = '';
    @track results = [];
    @track selectedRecord = null;
    @track isLoading = false;
    @track hasError = false;
    @track errorMessage = '';
    @track hasFocus = false;

    // Private variables
    debounceTimer;

    // Computed properties
    get showResults() {
        return this.hasFocus && this.results && this.results.length > 0;
    }

    get showNoResults() {
        return this.hasFocus && this.searchTerm && this.results.length === 0 && !this.isLoading;
    }

    get showClearButton() {
        return this.selectedRecord;
    }

    get getContainerClass() {
        return `slds-combobox_container ${this.selectedRecord ? 'slds-has-selection' : ''}`;
    }

    get getDropdownClass() {
        let classes = [
            'slds-combobox',
            'slds-dropdown-trigger',
            'slds-dropdown-trigger_click'
        ];

        if (this.hasFocus && !this.disabled) {
            classes.push('slds-is-open');
        }

        return classes.join(' ');
    }

    get getInputClass() {
        let classes = [
            'slds-input',
            'slds-combobox__input'
        ];

        if (this.hasError) {
            classes.push('slds-has-error');
        }

        return classes.join(' ');
    }

    get getItemClass() {
        return `slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta`;
    }

    // Event handlers
    handleKeyUp(event) {
        // Clear any existing timer
        window.clearTimeout(this.debounceTimer);

        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;

        // Reset selection
        if (this.selectedRecord && this.selectedRecord.title !== searchTerm) {
            this.selectedRecord = null;
        }

        // Don't search if term is too short
        if (searchTerm.length < this.minSearchTermLength) {
            this.results = [];
            return;
        }

        // Debounce the search
        this.debounceTimer = window.setTimeout(() => {
            this.performSearch(searchTerm);
        }, this.debounceDelay);
    }

    handleFocus() {
        this.hasFocus = true;
    }

    handleBlur() {
        // Delay hiding results to allow click events to fire
        window.setTimeout(() => {
            this.hasFocus = false;
        }, 300);
    }

    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.recordid;
        const name = event.currentTarget.dataset.name;

        this.selectedRecord = {
            id: recordId,
            title: name
        };

        this.searchTerm = name;
        this.results = [];

        // Notify parent of selection
        this.dispatchEvent(new CustomEvent('recordselected', {
            detail: {
                recordId: recordId,
                name: name
            }
        }));
    }

    handleClearSelection() {
        this.selectedRecord = null;
        this.searchTerm = '';
        this.results = [];

        // Notify parent of clearing
        this.dispatchEvent(new CustomEvent('clearselection'));

        // Focus the input after clearing
        this.template.querySelector('input').focus();
    }

    // Private methods
    async performSearch(searchTerm) {
        try {
            this.isLoading = true;
            this.hasError = false;

            // TODO: Replace with actual search implementation
            // This is a mock implementation
            await this.mockSearchDelay();
            this.results = this.getMockResults(searchTerm);

        } catch (error) {
            this.hasError = true;
            this.errorMessage = 'An error occurred while searching. Please try again.';
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    // Mock methods for demonstration
    mockSearchDelay() {
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    getMockResults(searchTerm) {
        const mockData = [
            { id: '1', title: 'Acme Corporation', subtitle: 'Manufacturing' },
            { id: '2', title: 'Apex Industries', subtitle: 'Technology' },
            { id: '3', title: 'Atlas Solutions', subtitle: 'Consulting' }
        ];

        return mockData.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Public methods
    @api
    clearSelection() {
        this.handleClearSelection();
    }

    @api
    setSearchTerm(term) {
        this.searchTerm = term;
        if (term && term.length >= this.minSearchTermLength) {
            this.performSearch(term);
        }
    }
}