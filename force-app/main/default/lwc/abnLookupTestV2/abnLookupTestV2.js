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
    @track currentPage = 1;
    @track pageSize = 10;
    @track totalResults = 0;
    
    // Component mode management
    get isSearchMode() {
        return !this.selectedEntity && !this.isReadOnly;
    }
    
    get isReadOnlyMode() {
        return this.selectedEntity !== null;
    }
    
    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading;
    }
    
    get showPagination() {
        return this.searchResults && this.searchResults.length > this.pageSize;
    }
    
    get searchButtonLabel() {
        return this.selectedEntity ? 'Change ABN' : 'Find ABN';
    }
    
    get searchButtonText() {
        return this.isLoading ? 'Searching...' : 'Search';
    }
    
    get resultCardClass() {
        // Responsive grid classes based on requirements
        return 'slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3 slds-x-large-size_1-of-4';
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
        if (!this.validateInput()) {
            return;
        }
        
        this.isLoading = true;
        this.clearError();
        this.searchResults = [];
        
        try {
            const result = await searchAbnEntities({ 
                searchTerm: this.searchTerm,
                pageSize: this.pageSize,
                pageNumber: this.currentPage
            });
            
            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSearchEvent('success', result.data);
            } else {
                this.handleSearchError(result.message);
            }
        } catch (error) {
            this.handleSearchError(error.body?.message || 'An unexpected error occurred');
        } finally {
            this.isLoading = false;
        }
    }
    
    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selected = this.searchResults.find(result => result.id === selectedId);
        
        if (selected) {
            this.selectedEntity = { ...selected };
            this.searchResults = [];
            this.paginatedResults = [];
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(this.selectedEntity);
        }
    }
    
    handleChangeAbn() {
        this.selectedEntity = null;
        this.searchTerm = '';
        this.searchResults = [];
        this.paginatedResults = [];
        this.clearError();
        
        // Dispatch change event to parent
        this.dispatchChangeEvent();
    }
    
    handlePaginationDataChange(event) {
        this.paginatedResults = event.detail.paginatedData;
        this.currentPage = event.detail.currentPage;
    }
    
    handlePageSizeChange(event) {
        this.pageSize = event.detail.pageSize;
        this.currentPage = 1;
    }
    
    // Validation methods
    validateInput() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            this.setError('Please enter a search term');
            return false;
        }
        
        const trimmedTerm = this.searchTerm.trim();
        
        // Check if it's a numeric input (ABN or ACN)
        if (/^\d+$/.test(trimmedTerm)) {
            if (trimmedTerm.length === 11) {
                // Valid ABN length
                return true;
            } else if (trimmedTerm.length === 9) {
                // Valid ACN length
                return true;
            } else {
                this.setError('An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again');
                return false;
            }
        }
        
        // Text search (business name) - minimum 2 characters
        if (trimmedTerm.length < 2) {
            this.setError('Please enter at least 2 characters for business name search');
            return false;
        }
        
        return true;
    }
    
    // Data processing methods
    processSearchResults(data) {
        if (!data || !data.results) {
            this.searchResults = [];
            this.paginatedResults = [];
            this.setError('No matching results found');
            return;
        }
        
        this.searchResults = data.results.map((item, index) => ({
            id: `result_${index}`,
            abn: item.abn?.identifier_value || '',
            formattedAbn: this.formatAbn(item.abn?.identifier_value || ''),
            entityName: item.other_trading_name?.organisation_name || 'N/A',
            status: `${item.entity_status?.entity_status_code || 'Unknown'} from ${this.formatDate(item.entity_status?.effective_from)}`,
            entityType: item.entity_type?.entity_description || 'N/A',
            gstStatus: item.goods_and_services_tax?.effective_from ? 
                `Registered from ${this.formatDate(item.goods_and_services_tax.effective_from)}` : 'Not registered',
            location: item.asic_number || 'N/A',
            rawData: item
        }));
        
        this.totalResults = data.totalCount || this.searchResults.length;
        this.paginatedResults = this.searchResults.slice(0, this.pageSize);
    }
    
    formatAbn(abn) {
        if (!abn || abn.length !== 11) return abn;
        return `${abn.substring(0, 2)} ${abn.substring(2, 5)} ${abn.substring(5, 8)} ${abn.substring(8, 11)}`;
    }
    
    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-AU', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
        } catch (error) {
            return dateString;
        }
    }
    
    // Error handling
    setError(message) {
        this.errorMessage = message;
    }
    
    clearError() {
        this.errorMessage = '';
    }
    
    handleSearchError(message) {
        this.setError(message || 'Search failed. Please try again.');
        this.dispatchErrorEvent(message);
    }
    
    // Parent communication events
    dispatchSelectionEvent(selectedEntity) {
        const selectionEvent = new CustomEvent('entityselected', {
            detail: {
                componentName: 'abnLookupTestV2',
                selectedEntity: selectedEntity,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectionEvent);
    }
    
    dispatchChangeEvent() {
        const changeEvent = new CustomEvent('entitychanged', {
            detail: {
                componentName: 'abnLookupTestV2',
                action: 'cleared',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }
    
    dispatchSearchEvent(type, data) {
        const searchEvent = new CustomEvent('searchcompleted', {
            detail: {
                componentName: 'abnLookupTestV2',
                type: type,
                data: data,
                resultCount: this.searchResults.length,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(searchEvent);
    }
    
    dispatchErrorEvent(message) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV2',
                errorMessage: message,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }
    
    // Public API methods for parent components
    @api
    refreshData() {
        if (this.searchTerm) {
            this.handleSearch();
        }
    }
    
    @api
    validateComponent() {
        return {
            isValid: this.selectedEntity !== null,
            selectedEntity: this.selectedEntity,
            hasError: this.errorMessage !== ''
        };
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
