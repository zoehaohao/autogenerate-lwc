import { LightningElement, api, track } from 'lwc';
import searchAbnEntities from '@salesforce/apex/abnLookupTestV2Controller.searchAbnEntities';

export default class AbnLookupTestV2 extends LightningElement {
    // Public API properties for parent component configuration
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    
    // Component state
    @track searchTerm = '';
    @track searchResults = [];
    @track paginatedResults = [];
    @track selectedEntity = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentMode = 'search'; // 'search' or 'readonly'
    
    // Pagination properties
    @track currentPage = 1;
    @track pageSize = 10;
    @track totalResults = 0;
    
    // Computed properties
    get isSearchMode() {
        return this.currentMode === 'search' && !this.selectedEntity;
    }
    
    get isReadOnlyMode() {
        return this.currentMode === 'readonly' || this.selectedEntity;
    }
    
    get hasError() {
        return this.errorMessage && this.errorMessage.length > 0;
    }
    
    get hasSearchResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading && this.currentMode === 'search';
    }
    
    get showPagination() {
        return this.searchResults && this.searchResults.length > this.pageSize;
    }
    
    get searchButtonClass() {
        return `slds-button slds-button_brand ${this.template.querySelector('.slds-card__body').offsetWidth < 768 ? 'slds-size_1-of-1' : ''}`;
    }
    
    get resultsGridClass() {
        return 'slds-grid slds-wrap slds-gutters results-grid';
    }
    
    // Lifecycle hooks
    connectedCallback() {
        if (this.initialData) {
            this.selectedEntity = this.initialData;
            this.currentMode = 'readonly';
        }
    }
    
    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.clearError();
    }
    
    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }
    
    async handleSearch() {
        if (!this.validateSearchInput()) {
            return;
        }
        
        this.isLoading = true;
        this.clearError();
        this.searchResults = [];
        
        try {
            const result = await searchAbnEntities({ 
                searchTerm: this.searchTerm.trim() 
            });
            
            if (result.success) {
                if (result.data && result.data.length > 0) {
                    this.searchResults = this.processSearchResults(result.data);
                    this.totalResults = this.searchResults.length;
                    this.updatePaginatedResults();
                    
                    // Dispatch search success event to parent
                    this.dispatchSearchEvent('success', {
                        searchTerm: this.searchTerm,
                        resultCount: this.searchResults.length
                    });
                } else {
                    this.errorMessage = `No matching results for ${this.searchTerm}, please check the inputs and try again.`;
                    this.dispatchSearchEvent('noresults', { searchTerm: this.searchTerm });
                }
            } else {
                this.errorMessage = result.message || 'An error occurred while searching. Please try again.';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.dispatchErrorEvent(error.message);
        } finally {
            this.isLoading = false;
        }
    }
    
    handleSelectEntity(event) {
        const entityId = event.target.dataset.id;
        const selectedEntity = this.searchResults.find(entity => entity.id === entityId);
        
        if (selectedEntity) {
            this.selectedEntity = selectedEntity;
            this.currentMode = 'readonly';
            
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('entityselected', {
                detail: {
                    componentName: 'abnLookupTestV2',
                    selectedEntity: this.selectedEntity,
                    timestamp: new Date().toISOString()
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectionEvent);
        }
    }
    
    handleChangeAbn() {
        this.selectedEntity = null;
        this.currentMode = 'search';
        this.searchTerm = '';
        this.searchResults = [];
        this.clearError();
        
        // Dispatch change event to parent
        const changeEvent = new CustomEvent('abnchange', {
            detail: {
                componentName: 'abnLookupTestV2',
                action: 'change',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }
    
    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
        this.currentPage = event.detail.currentPage;
    }
    
    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize;
        this.updatePaginatedResults();
    }
    
    // Validation methods
    validateSearchInput() {
        const trimmedTerm = this.searchTerm.trim();
        
        if (!trimmedTerm) {
            this.errorMessage = 'Please enter a search term.';
            return false;
        }
        
        // Check if it's a numeric input (ABN or ACN)
        if (/^\d+$/.test(trimmedTerm)) {
            if (trimmedTerm.length === 11) {
                // ABN validation
                return this.validateABN(trimmedTerm);
            } else if (trimmedTerm.length === 9) {
                // ACN validation
                return true;
            } else {
                this.errorMessage = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
                return false;
            }
        }
        
        // Business name search - basic validation
        if (trimmedTerm.length < 2) {
            this.errorMessage = 'Business name must be at least 2 characters long.';
            return false;
        }
        
        return true;
    }
    
    validateABN(abn) {
        // Basic ABN validation - check if it's 11 digits
        if (abn.length !== 11 || !/^\d{11}$/.test(abn)) {
            this.errorMessage = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
            return false;
        }
        return true;
    }
    
    // Utility methods
    processSearchResults(rawResults) {
        return rawResults.map((result, index) => {
            return {
                id: `result-${index}`,
                abnNumber: result.abnNumber || '',
                formattedAbn: this.formatABN(result.abnNumber || ''),
                entityName: result.entityName || '',
                businessName: result.businessName || '',
                abnStatus: result.abnStatus || '',
                entityType: result.entityType || '',
                gstStatus: result.gstStatus || '',
                mainBusinessLocation: result.mainBusinessLocation || '',
                rawData: result
            };
        });
    }
    
    formatABN(abn) {
        if (!abn || abn.length !== 11) return abn;
        return `${abn.substring(0, 2)} ${abn.substring(2, 5)} ${abn.substring(5, 8)} ${abn.substring(8, 11)}`;
    }
    
    updatePaginatedResults() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedResults = this.searchResults.slice(startIndex, endIndex);
    }
    
    clearError() {
        this.errorMessage = '';
    }
    
    // Event dispatch methods
    dispatchSearchEvent(type, detail) {
        const searchEvent = new CustomEvent('search', {
            detail: {
                componentName: 'abnLookupTestV2',
                type: type,
                ...detail,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(searchEvent);
    }
    
    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV2',
                errorMessage: errorMessage,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }
    
    // Public API methods for parent component
    @api
    refreshData() {
        if (this.searchTerm) {
            this.handleSearch();
        }
    }
    
    @api
    validateComponent() {
        return this.selectedEntity !== null;
    }
    
    @api
    clearSelection() {
        this.handleChangeAbn();
    }
    
    @api
    getSelectedEntity() {
        return this.selectedEntity;
    }
}
