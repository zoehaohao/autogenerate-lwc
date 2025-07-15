import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track selectedEntity = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track validationError = '';
    @track currentPage = 1;
    @track pageSize = 10;
    @track totalResults = 0;
    @track currentMode = 'search'; // search, change, find, selected
    
    // Component state getters
    get isSearchMode() {
        return this.currentMode === 'search' && !this.selectedEntity;
    }
    
    get isSelectedMode() {
        return this.selectedEntity !== null;
    }
    
    get hasResults() {
        return this.searchResults.length > 0 && !this.isLoading && !this.selectedEntity;
    }
    
    get showEmptyState() {
        return this.searchResults.length === 0 && !this.isLoading && !this.selectedEntity && this.searchTerm && !this.errorMessage;
    }
    
    get showPagination() {
        return this.totalResults > this.pageSize;
    }
    
    // Button styling getters
    get searchButtonClass() {
        return this.currentMode === 'search' ? 'slds-button slds-button_brand' : 'slds-button slds-button_neutral';
    }
    
    get changeButtonClass() {
        return this.currentMode === 'change' ? 'slds-button slds-button_brand' : 'slds-button slds-button_neutral';
    }
    
    get findButtonClass() {
        return this.currentMode === 'find' ? 'slds-button slds-button_brand' : 'slds-button slds-button_neutral';
    }
    
    // Pagination getters
    get paginatedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.searchResults.slice(start, end);
    }
    
    get startRecord() {
        return this.searchResults.length > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
    }
    
    get endRecord() {
        const end = this.currentPage * this.pageSize;
        return end > this.totalResults ? this.totalResults : end;
    }
    
    get isFirstPage() {
        return this.currentPage === 1;
    }
    
    get isLastPage() {
        return this.currentPage >= Math.ceil(this.totalResults / this.pageSize);
    }
    
    get pageNumbers() {
        const totalPages = Math.ceil(this.totalResults / this.pageSize);
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push({
                value: i,
                label: i.toString(),
                cssClass: i === this.currentPage ? 'slds-button slds-button_brand' : 'slds-button slds-button_neutral'
            });
        }
        
        return pages;
    }
    
    // Event handlers
    handleSearchModeClick() {
        this.currentMode = 'search';
        this.clearSelection();
    }
    
    handleChangeModeClick() {
        this.currentMode = 'change';
        this.clearSelection();
    }
    
    handleFindModeClick() {
        this.currentMode = 'find';
        this.clearSelection();
    }
    
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.validationError = '';
        this.errorMessage = '';
    }
    
    handleKeyUp(event) {
        if (event.keyCode === 13) {
            this.handleSearch();
        }
    }
    
    async handleSearch() {
        if (!this.searchTerm.trim()) {
            this.validationError = 'Please enter a search term';
            return;
        }
        
        // Validate input format
        const validationResult = this.validateInput(this.searchTerm.trim());
        if (!validationResult.isValid) {
            this.validationError = validationResult.message;
            return;
        }
        
        this.isLoading = true;
        this.errorMessage = '';
        this.validationError = '';
        this.currentPage = 1;
        
        try {
            const result = await searchABN({
                searchTerm: this.searchTerm.trim(),
                searchType: this.determineSearchType(this.searchTerm.trim()),
                pageNumber: this.currentPage,
                pageSize: this.pageSize
            });
            
            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSearchEvent('success', result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.searchResults = [];
                this.totalResults = 0;
                this.dispatchSearchEvent('error', { message: this.errorMessage });
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.searchResults = [];
            this.totalResults = 0;
            this.dispatchSearchEvent('error', { message: this.errorMessage });
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
            this.currentMode = 'selected';
            
            // Dispatch selection event to parent
            this.dispatchSelectionEvent(this.selectedEntity);
        }
    }
    
    // Pagination handlers
    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }
    
    handleNextPage() {
        if (!this.isLastPage) {
            this.currentPage++;
        }
    }
    
    handlePageClick(event) {
        const pageNumber = parseInt(event.currentTarget.dataset.page, 10);
        this.currentPage = pageNumber;
    }
    
    // Utility methods
    validateInput(input) {
        const numericInput = input.replace(/\s/g, '');
        
        // Check if it's numeric
        if (/^\d+$/.test(numericInput)) {
            if (numericInput.length === 11) {
                return { isValid: true, type: 'abn' };
            } else if (numericInput.length === 9) {
                return { isValid: true, type: 'acn' };
            } else {
                return {
                    isValid: false,
                    message: 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again'
                };
            }
        }
        
        // Assume it's a business name if not numeric
        return { isValid: true, type: 'name' };
    }
    
    determineSearchType(input) {
        const numericInput = input.replace(/\s/g, '');
        
        if (/^\d{11}$/.test(numericInput)) {
            return 'abn';
        } else if (/^\d{9}$/.test(numericInput)) {
            return 'acn';
        } else {
            return 'name';
        }
    }
    
    processSearchResults(data) {
        if (data && data.results) {
            this.searchResults = data.results.map((result, index) => ({
                id: `result-${index}-${result.abn?.identifier_value || Math.random()}`,
                abn: result.abn?.identifier_value || '',
                formattedAbn: this.formatABN(result.abn?.identifier_value || ''),
                entityName: result.entity_name || result.other_trading_name?.organisation_name || 'N/A',
                status: this.formatStatus(result.entity_status?.entity_status_code, result.entity_status?.effective_from),
                entityType: result.entity_type?.entity_description || 'N/A',
                gstStatus: this.formatGSTStatus(result.goods_and_services_tax),
                location: result.main_business_location || 'N/A'
            }));
            
            this.totalResults = data.totalCount || this.searchResults.length;
        } else {
            this.searchResults = [];
            this.totalResults = 0;
        }
    }
    
    formatABN(abn) {
        if (!abn || abn.length !== 11) return abn;
        return `${abn.substring(0, 2)} ${abn.substring(2, 5)} ${abn.substring(5, 8)} ${abn.substring(8, 11)}`;
    }
    
    formatStatus(statusCode, effectiveFrom) {
        if (!statusCode) return 'Unknown';
        return effectiveFrom ? `${statusCode} from ${this.formatDate(effectiveFrom)}` : statusCode;
    }
    
    formatGSTStatus(gstData) {
        if (!gstData) return 'Not registered';
        return gstData.effective_from ? `Registered from ${this.formatDate(gstData.effective_from)}` : 'Registered';
    }
    
    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-AU', { 
                day: '2-digit', 
                month: '3-letter', 
                year: 'numeric' 
            });
        } catch (error) {
            return dateString;
        }
    }
    
    clearSelection() {
        this.selectedEntity = null;
        this.searchResults = [];
        this.errorMessage = '';
        this.validationError = '';
        this.searchTerm = '';
        this.currentPage = 1;
        this.totalResults = 0;
    }
    
    // Parent communication methods
    dispatchSelectionEvent(selectedEntity) {
        const selectionEvent = new CustomEvent('entityselected', {
            detail: {
                componentName: 'abnLookupTestV2',
                selectedEntity: selectedEntity,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectionEvent);
    }
    
    dispatchSearchEvent(type, data) {
        const searchEvent = new CustomEvent('searchcomplete', {
            detail: {
                componentName: 'abnLookupTestV2',
                type: type,
                data: data,
                searchTerm: this.searchTerm,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(searchEvent);
    }
    
    // Public API methods for parent components
    @api
    refreshData() {
        this.clearSelection();
    }
    
    @api
    validateComponent() {
        return {
            isValid: this.selectedEntity !== null,
            selectedEntity: this.selectedEntity,
            hasSelection: this.selectedEntity !== null
        };
    }
    
    @api
    getSelectedEntity() {
        return this.selectedEntity;
    }
    
    @api
    clearSelection() {
        this.clearSelection();
    }
}
