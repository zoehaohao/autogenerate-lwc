import { LightningElement, api, track } from 'lwc';
import searchAbnEntities from '@salesforce/apex/abnLookupTestV2Controller.searchAbnEntities';
import verifyAbnEntity from '@salesforce/apex/abnLookupTestV2Controller.verifyAbnEntity';

export default class AbnLookupTestV2 extends LightningElement {
    @api mode = 'Search'; // Search or Verify
    @api pageSize = 10;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track selectedEntity = null;
    @track isLoading = false;
    @track errorMessage = '';
    @track currentPage = 1;
    @track totalRecords = 0;

    // Computed properties
    get isSearchMode() {
        return this.mode === 'Search';
    }

    get isVerifyMode() {
        return this.mode === 'Verify';
    }

    get modeButtonLabel() {
        return this.isSearchMode ? 'Find ABN' : 'Find ABN';
    }

    get modeDescription() {
        if (this.isSearchMode) {
            return 'You can find an Australian Business Number (ABN) using the ABN itself, Company / Business / Trading name or Australian Company Number (ACN). Once the correct entity has been identified you can select it for use.';
        }
        return 'You can find verify the identify of a Company / Business / Trading through using Australian Business Number (ABN).';
    }

    get searchPlaceholder() {
        return this.isSearchMode ? 'Search by Business name, ABN or ACN' : 'Enter ABN or ACN';
    }

    get actionButtonLabel() {
        return this.isSearchMode ? 'Search' : 'Verify';
    }

    get selectionButtonLabel() {
        return this.isSearchMode ? 'Select' : 'Confirm';
    }

    get showResults() {
        return this.searchResults.length > 0 && !this.isLoading && !this.selectedEntity;
    }

    get showSelectedEntity() {
        return this.selectedEntity !== null;
    }

    get showPagination() {
        return this.totalRecords > this.pageSize;
    }

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get startRecord() {
        return ((this.currentPage - 1) * this.pageSize) + 1;
    }

    get endRecord() {
        const end = this.currentPage * this.pageSize;
        return end > this.totalRecords ? this.totalRecords : end;
    }

    get paginatedResults() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.searchResults.slice(start, end);
    }

    get pageNumbers() {
        const pages = [];
        const totalPages = this.totalPages;
        const current = this.currentPage;
        
        // Show first page
        if (current > 3) {
            pages.push({ value: 1, variant: 'neutral' });
            if (current > 4) {
                pages.push({ value: '...', variant: 'neutral', disabled: true });
            }
        }
        
        // Show pages around current
        for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
            pages.push({ 
                value: i, 
                variant: i === current ? 'brand' : 'neutral' 
            });
        }
        
        // Show last page
        if (current < totalPages - 2) {
            if (current < totalPages - 3) {
                pages.push({ value: '...', variant: 'neutral', disabled: true });
            }
            pages.push({ value: totalPages, variant: 'neutral' });
        }
        
        return pages;
    }

    get resultCardClass() {
        // Responsive grid classes based on requirements
        return 'slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3 slds-x-large-size_1-of-4';
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (!this.searchTerm.trim()) {
            this.errorMessage = 'Please enter a search term';
            return;
        }

        // Validate input format
        if (!this.validateInput(this.searchTerm.trim())) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.currentPage = 1;

        try {
            let result;
            if (this.isSearchMode) {
                result = await searchAbnEntities({ 
                    searchTerm: this.searchTerm.trim(),
                    pageSize: this.pageSize,
                    pageNumber: this.currentPage
                });
            } else {
                result = await verifyAbnEntity({ 
                    abnOrAcn: this.searchTerm.trim() 
                });
            }

            if (result.success) {
                this.searchResults = this.processSearchResults(result.data.entities || []);
                this.totalRecords = result.data.totalCount || this.searchResults.length;
                
                if (this.searchResults.length === 0) {
                    this.errorMessage = `No matching results for ${this.searchTerm}, please check the inputs and try again.`;
                }
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.searchResults = [];
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.searchResults = [];
        } finally {
            this.isLoading = false;
        }
    }

    validateInput(input) {
        const cleanInput = input.replace(/\s/g, '');
        
        // Check if it's numeric (ABN or ACN)
        if (/^\d+$/.test(cleanInput)) {
            if (cleanInput.length === 11) {
                // Valid ABN length
                return true;
            } else if (cleanInput.length === 9) {
                // Valid ACN length
                return true;
            } else {
                this.errorMessage = 'An ABN requires 11 digits and an ACN requires 9 digits, check the number and try again';
                return false;
            }
        }
        
        // For search mode, allow business names
        if (this.isSearchMode) {
            return true;
        }
        
        // For verify mode, only allow ABN/ACN
        this.errorMessage = 'Please enter a valid ABN (11 digits) or ACN (9 digits)';
        return false;
    }

    processSearchResults(entities) {
        return entities.map(entity => ({
            abn: entity.abn?.identifier_value || '',
            formattedAbn: this.formatAbn(entity.abn?.identifier_value || ''),
            entityName: entity.entity_name || entity.other_trading_name?.organisation_name || 'N/A',
            status: entity.entity_status?.entity_status_code === 'Active' ? 
                   `Active from ${this.formatDate(entity.entity_status?.effective_from)}` : 
                   entity.entity_status?.entity_status_code || 'Unknown',
            entityType: entity.entity_type?.entity_description || 'N/A',
            gstStatus: entity.goods_and_services_tax?.effective_from ? 
                      `Registered from ${this.formatDate(entity.goods_and_services_tax.effective_from)}` : 
                      'Not registered',
            location: entity.main_business_location || 'N/A'
        }));
    }

    formatAbn(abn) {
        if (!abn || abn.length !== 11) return abn;
        return `${abn.substring(0, 2)} ${abn.substring(2, 5)} ${abn.substring(5, 8)} ${abn.substring(8, 11)}`;
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') return '';
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

    handleSelectEntity(event) {
        const selectedAbn = event.target.dataset.abn;
        const entity = this.searchResults.find(result => result.abn === selectedAbn);
        
        if (entity) {
            this.selectedEntity = { ...entity };
            
            // Dispatch selection event to parent
            const selectionEvent = new CustomEvent('entityselection', {
                detail: {
                    selectedEntity: this.selectedEntity,
                    mode: this.mode,
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
        this.searchResults = [];
        this.searchTerm = '';
        this.errorMessage = '';
        this.currentPage = 1;
        this.totalRecords = 0;
    }

    handlePreviousPage() {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.handleSearch();
        }
    }

    handleNextPage() {
        if (!this.isLastPage) {
            this.currentPage++;
            this.handleSearch();
        }
    }

    handlePageClick(event) {
        const page = parseInt(event.target.dataset.page);
        if (page && page !== this.currentPage) {
            this.currentPage = page;
            this.handleSearch();
        }
    }

    // Public API methods for parent components
    @api
    clearSelection() {
        this.handleChangeAbn();
    }

    @api
    getSelectedEntity() {
        return this.selectedEntity;
    }

    @api
    setMode(newMode) {
        if (newMode === 'Search' || newMode === 'Verify') {
            this.mode = newMode;
            this.handleChangeAbn();
        }
    }
}
