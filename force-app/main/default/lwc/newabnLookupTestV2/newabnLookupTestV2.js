import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/newabnLookupTestV2Controller.searchABN';

export default class NewabnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = '';
    @track hasSearched = false;

    // Computed properties
    get searchPlaceholder() {
        switch (this.searchType) {
            case 'ABN':
                return 'Enter 11-digit ABN number';
            case 'ACN':
                return 'Enter 9-digit ACN number';
            case 'NAME':
                return 'Enter company name (minimum 2 characters)';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.isValidInput || this.isReadOnly;
    }

    get isValidInput() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
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
        if (trimmedTerm.length >= 2 && /^[a-zA-Z0-9\s&.-]+$/.test(trimmedTerm)) {
            return true;
        }
        
        return false;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return this.hasSearched && !this.isLoading && !this.hasResults && !this.errorMessage;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.clearMessages();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    async handleSearch() {
        if (!this.isValidInput) {
            this.errorMessage = 'Please enter a valid ABN (11 digits), ACN (9 digits), or company name (minimum 2 characters).';
            return;
        }

        this.isLoading = true;
        this.clearMessages();
        this.hasSearched = true;

        try {
            const searchData = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchData: JSON.stringify(searchData) });

            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSuccessEvent(result.data);
            } else {
                this.errorMessage = result.message || 'An error occurred while searching. Please try again.';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
            this.dispatchErrorEvent(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    handleSelectResult(event) {
        const resultId = event.target.dataset.resultId;
        const selectedResult = this.searchResults.find(result => result.id === resultId);
        
        if (selectedResult) {
            this.dispatchSelectionEvent(selectedResult);
        }
    }

    // Helper methods
    detectSearchType() {
        const trimmedTerm = this.searchTerm.trim();
        
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = 'ABN';
        } else if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = 'ACN';
        } else if (trimmedTerm.length >= 2) {
            this.searchType = 'NAME';
        } else {
            this.searchType = '';
        }
    }

    processSearchResults(data) {
        if (!data) {
            this.searchResults = [];
            return;
        }

        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        this.searchResults = results.map((item, index) => {
            return {
                id: `result-${index}`,
                abnNumber: this.getFieldValue(item, 'abn.identifier_value'),
                entityName: this.getFieldValue(item, 'other_trading_name.organisation_name') || 'N/A',
                abnStatus: this.formatAbnStatus(item),
                entityType: this.getFieldValue(item, 'entity_type.entity_description'),
                gstStatus: this.formatGstStatus(item),
                mainBusinessLocation: this.getFieldValue(item, 'main_business_location') || 'N/A',
                asicNumber: this.getFieldValue(item, 'asic_number'),
                dgrEndorsement: this.formatDgrEndorsement(item),
                rawData: item
            };
        });
    }

    getFieldValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    formatAbnStatus(item) {
        const status = this.getFieldValue(item, 'entity_status.entity_status_code');
        const effectiveFrom = this.getFieldValue(item, 'entity_status.effective_from');
        
        if (status && effectiveFrom) {
            return `${status} from ${this.formatDate(effectiveFrom)}`;
        }
        return status || 'N/A';
    }

    formatGstStatus(item) {
        const effectiveFrom = this.getFieldValue(item, 'goods_and_services_tax.effective_from');
        
        if (effectiveFrom && effectiveFrom !== '0001-01-01') {
            return `Registered from ${this.formatDate(effectiveFrom)}`;
        }
        return 'Not registered';
    }

    formatDgrEndorsement(item) {
        const endorsement = this.getFieldValue(item, 'dgr_endorsement.entity_endorsement');
        const itemNumber = this.getFieldValue(item, 'dgr_endorsement.item_number');
        
        if (endorsement && itemNumber) {
            return `${endorsement} - ${itemNumber}`;
        }
        return endorsement || 'N/A';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01') {
            return 'N/A';
        }
        
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

    clearMessages() {
        this.errorMessage = '';
    }

    // Public API methods
    @api
    refreshData() {
        if (this.searchTerm && this.isValidInput) {
            this.handleSearch();
        }
    }

    @api
    validateComponent() {
        return this.isValidInput;
    }

    @api
    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.searchType = '';
        this.hasSearched = false;
        this.clearMessages();
    }

    // Custom events for parent communication
    dispatchSuccessEvent(data) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'newabnLookupTestV2',
                result: data,
                message: 'Search completed successfully',
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'newabnLookupTestV2',
                errorMessage: error,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchSelectionEvent(selectedResult) {
        const selectionEvent = new CustomEvent('resultselected', {
            detail: {
                componentName: 'newabnLookupTestV2',
                selectedResult: selectedResult,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchDataChangeEvent(newValue, oldValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'newabnLookupTestV2',
                newValue: newValue,
                oldValue: oldValue,
                isValid: this.validateComponent(),
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(changeEvent);
    }
}
