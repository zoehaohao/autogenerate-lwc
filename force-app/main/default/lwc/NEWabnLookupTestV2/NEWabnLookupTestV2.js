import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/NEWabnLookupTestV2Controller.searchABN';

export default class NEWabnLookupTestV2 extends LightningElement {
    // Public API properties for parent components
    @api recordId;
    @api configSettings;
    @api initialSearchTerm = '';
    @api isReadOnly = false;

    // Tracked properties
    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedEntity = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentSearchType = 'name';
    @track currentView = 'search'; // 'search', 'results', 'selected'

    // Search type constants
    searchTypes = {
        ABN: 'abn',
        ACN: 'acn',
        NAME: 'name'
    };

    connectedCallback() {
        if (this.initialSearchTerm) {
            this.searchTerm = this.initialSearchTerm;
            this.detectSearchType();
        }
    }

    // Computed properties
    get actionButtonLabel() {
        return this.currentView === 'selected' ? 'Change ABN' : 'Find ABN';
    }

    get searchInstructions() {
        if (this.currentView === 'selected') {
            return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
        }
        return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
    }

    get searchPlaceholder() {
        switch (this.currentSearchType) {
            case this.searchTypes.ABN:
                return 'Enter 11-digit ABN number';
            case this.searchTypes.ACN:
                return 'Enter 9-digit ACN number';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get searchButtonLabel() {
        return this.currentView === 'selected' ? 'Verify' : 'Search';
    }

    get isSearchDisabled() {
        return this.isLoading || !this.isValidSearchTerm || this.isReadOnly;
    }

    get isValidSearchTerm() {
        if (!this.searchTerm || this.searchTerm.trim().length < 2) {
            return false;
        }

        const trimmedTerm = this.searchTerm.trim();
        
        // ABN validation (11 digits)
        if (/^\d{11}$/.test(trimmedTerm)) {
            return true;
        }
        
        // ACN validation (9 digits)
        if (/^\d{9}$/.test(trimmedTerm)) {
            return true;
        }
        
        // Company name validation (minimum 2 characters)
        if (trimmedTerm.length >= 2) {
            return true;
        }
        
        return false;
    }

    get showError() {
        return !this.isLoading && this.errorMessage && this.errorMessage.length > 0;
    }

    get showNoResults() {
        return !this.isLoading && !this.showError && this.searchResults.length === 0 && this.searchTerm && this.currentView === 'results';
    }

    get showResults() {
        return !this.isLoading && !this.showError && this.searchResults.length > 0 && this.currentView === 'results';
    }

    get showSelectedEntity() {
        return this.currentView === 'selected' && this.selectedEntity;
    }

    get showPagination() {
        return this.searchResults.length > 10;
    }

    // Event handlers
    handleActionButtonClick() {
        if (this.currentView === 'selected') {
            this.currentView = 'search';
            this.selectedEntity = null;
            this.searchResults = [];
            this.paginatedResults = [];
            this.searchTerm = '';
            this.errorMessage = '';
        }
        // If currentView is 'search', the button doesn't need additional action
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.errorMessage = '';
    }

    detectSearchType() {
        if (!this.searchTerm) {
            this.currentSearchType = this.searchTypes.NAME;
            return;
        }

        const trimmedTerm = this.searchTerm.trim();
        
        // Check for ABN (11 digits)
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.currentSearchType = this.searchTypes.ABN;
        }
        // Check for ACN (9 digits)
        else if (/^\d{9}$/.test(trimmedTerm)) {
            this.currentSearchType = this.searchTypes.ACN;
        }
        // Default to name search
        else {
            this.currentSearchType = this.searchTypes.NAME;
        }
    }

    async handleSearch() {
        if (!this.isValidSearchTerm) {
            this.errorMessage = 'Please enter a valid search term';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.searchResults = [];
        this.paginatedResults = [];

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.currentSearchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });

            if (result.success) {
                this.searchResults = result.data || [];
                this.currentView = 'results';
                
                // Dispatch success event to parent
                this.dispatchSearchEvent('success', {
                    searchTerm: this.searchTerm,
                    searchType: this.currentSearchType,
                    resultCount: this.searchResults.length
                });
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.dispatchSearchEvent('error', {
                    searchTerm: this.searchTerm,
                    errorMessage: this.errorMessage
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again.';
            this.dispatchSearchEvent('error', {
                searchTerm: this.searchTerm,
                errorMessage: this.errorMessage
            });
        } finally {
            this.isLoading = false;
        }
    }

    handleSelectEntity(event) {
        const entityId = event.target.dataset.entityId;
        const selectedEntity = this.searchResults.find(entity => entity.id === entityId);
        
        if (selectedEntity) {
            this.selectedEntity = selectedEntity;
            this.currentView = 'selected';
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent('entityselected', {
                selectedEntity: this.selectedEntity
            });
        }
    }

    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData || [];
    }

    handlePageSizeChange(event) {
        console.log('Page size changed to:', event.detail.pageSize);
    }

    // Custom event dispatchers for parent communication
    dispatchSearchEvent(eventType, detail) {
        const searchEvent = new CustomEvent('search' + eventType, {
            detail: {
                componentName: 'NEWabnLookupTestV2',
                ...detail,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(searchEvent);
    }

    dispatchSelectionEvent(eventType, detail) {
        const selectionEvent = new CustomEvent(eventType, {
            detail: {
                componentName: 'NEWabnLookupTestV2',
                ...detail,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.searchResults = [];
        this.paginatedResults = [];
        this.selectedEntity = null;
        this.currentView = 'search';
        this.errorMessage = '';
    }

    @api
    validateComponent() {
        return {
            isValid: this.selectedEntity !== null,
            selectedEntity: this.selectedEntity,
            hasErrors: this.showError
        };
    }

    @api
    getSelectedEntity() {
        return this.selectedEntity;
    }

    @api
    setSearchTerm(searchTerm) {
        this.searchTerm = searchTerm;
        this.detectSearchType();
    }
}
