import { LightningElement, api, track } from 'lwc';
import searchContactsByName from '@salesforce/apex/ContactSearchTestController.searchContactsByName';

export default class ContactSearchTest extends LightningElement {
    // Public API properties for parent configuration
    @api searchPlaceholder = 'Enter contact name...';
    @api maxResults = 50;
    @api showAccountName = true;

    // Tracked properties
    @track searchTerm = '';
    @track contacts = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track hasSearched = false;
    @track showValidationError = false;
    @track sortedBy = 'LastName';
    @track sortedDirection = 'asc';

    // Computed properties
    get isSearchDisabled() {
        return this.isLoading || this.searchTerm.length < 2;
    }

    get showResults() {
        return !this.isLoading && this.hasSearched && this.contacts.length > 0 && !this.errorMessage;
    }

    get showEmptyState() {
        return !this.isLoading && this.hasSearched && this.contacts.length === 0 && !this.errorMessage;
    }

    get showError() {
        return !this.isLoading && this.errorMessage;
    }

    get resultCount() {
        return this.contacts ? this.contacts.length : 0;
    }

    get columns() {
        const baseColumns = [
            {
                label: 'Name',
                fieldName: 'Name',
                type: 'text',
                sortable: true,
                cellAttributes: { alignment: 'left' }
            },
            {
                label: 'Email',
                fieldName: 'Email',
                type: 'email',
                sortable: true
            },
            {
                label: 'Phone',
                fieldName: 'Phone',
                type: 'phone',
                sortable: true
            },
            {
                label: 'Title',
                fieldName: 'Title',
                type: 'text',
                sortable: true
            }
        ];

        if (this.showAccountName) {
            baseColumns.splice(3, 0, {
                label: 'Account Name',
                fieldName: 'AccountName',
                type: 'text',
                sortable: true
            });
        }

        return baseColumns;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.showValidationError = false;
        this.errorMessage = '';
    }

    handleSearch() {
        if (this.searchTerm.length < 2) {
            this.showValidationError = true;
            this.focusSearchInput();
            return;
        }

        this.performSearch();
    }

    handleClear() {
        this.clearResults();
        this.focusSearchInput();
    }

    handleSort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        this.sortContacts();
    }

    // Public methods for parent component interaction
    @api
    clearResults() {
        this.searchTerm = '';
        this.contacts = [];
        this.hasSearched = false;
        this.errorMessage = '';
        this.showValidationError = false;
        this.isLoading = false;
    }

    @api
    focusSearchInput() {
        const searchInput = this.template.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    @api
    performSearchWithTerm(searchTerm) {
        if (searchTerm && searchTerm.length >= 2) {
            this.searchTerm = searchTerm;
            this.performSearch();
        }
    }

    // Private methods
    async performSearch() {
        this.isLoading = true;
        this.errorMessage = '';
        this.showValidationError = false;

        try {
            const result = await searchContactsByName({
                searchTerm: this.searchTerm,
                limitResults: this.maxResults
            });

            if (result.success) {
                this.contacts = this.processContactData(result.data);
                this.hasSearched = true;
                this.sortContacts();
                this.publishSearchEvent();
            } else {
                this.errorMessage = result.message || 'An error occurred while searching contacts';
                this.contacts = [];
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to search contacts. Please try again.';
            this.contacts = [];
        } finally {
            this.isLoading = false;
        }
    }

    processContactData(contactData) {
        if (!contactData || !Array.isArray(contactData)) {
            return [];
        }

        return contactData.map(contact => ({
            Id: contact.Id,
            Name: contact.Name || `${contact.FirstName || ''} ${contact.LastName || ''}`.trim(),
            Email: contact.Email || '',
            Phone: contact.Phone || '',
            AccountName: contact.Account?.Name || '',
            Title: contact.Title || '',
            FirstName: contact.FirstName || '',
            LastName: contact.LastName || ''
        }));
    }

    sortContacts() {
        if (!this.contacts || this.contacts.length === 0) return;

        const isReverse = this.sortedDirection === 'desc';
        const contacts = [...this.contacts];

        contacts.sort((a, b) => {
            let aVal = a[this.sortedBy] || '';
            let bVal = b[this.sortedBy] || '';

            // Convert to string for comparison
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();

            if (aVal < bVal) {
                return isReverse ? 1 : -1;
            }
            if (aVal > bVal) {
                return isReverse ? -1 : 1;
            }
            return 0;
        });

        this.contacts = contacts;
    }

    publishSearchEvent() {
        const searchEvent = new CustomEvent('contactsearch', {
            detail: {
                searchTerm: this.searchTerm,
                results: this.contacts,
                resultCount: this.contacts.length,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(searchEvent);
    }

    // Lifecycle hooks
    connectedCallback() {
        // Component initialization
        this.focusSearchInput();
    }

    // Keyboard event handling
    handleKeyDown(event) {
        if (event.key === 'Enter' && !this.isSearchDisabled) {
            this.handleSearch();
        }
    }
}
