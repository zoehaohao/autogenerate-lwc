import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupWorkingExampleController.searchABN';

export default class AbnLookupWorkingExample extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track searchType = 'name';
    
    // Computed properties
    get searchPlaceholder() {
        switch (this.searchType) {
            case 'abn':
                return 'Enter 11-digit ABN number';
            case 'acn':
                return 'Enter 9-digit ACN number';
            default:
                return 'Search by Business name, ABN or ACN';
        }
    }

    get isSearchDisabled() {
        return this.isLoading || !this.isValidSearchTerm;
    }

    get isValidSearchTerm() {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            return false;
        }

        const trimmedTerm = this.searchTerm.trim();
        
        // ABN validation (11 digits)
        if (/^\d{11}$/.test(trimmedTerm)) {
            this.searchType = 'abn';
            return true;
        }
        
        // ACN validation (9 digits)
        if (/^\d{9}$/.test(trimmedTerm)) {
            this.searchType = 'acn';
            return true;
        }
        
        // Company name validation (minimum 2 characters)
        if (trimmedTerm.length >= 2) {
            this.searchType = 'name';
            return true;
        }
        
        return false;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading && !this.errorMessage;
    }

    get showNoResults() {
        return !this.isLoading && !this.errorMessage && this.searchResults && this.searchResults.length === 0 && this.searchTerm.trim().length > 0;
    }

    // Event handlers
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.errorMessage = '';
    }

    handleKeyUp(event) {
        if (event.keyCode === 13 && this.isValidSearchTerm) { // Enter key
            this.handleSearch();
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

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.searchResults = this.processSearchResults(result.data);
                this.dispatchSearchSuccessEvent(this.searchResults);
            } else {
                this.errorMessage = result.message || 'An error occurred during search';
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'Unable to perform search. Please try again later.';
            this.dispatchErrorEvent(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    handleSelectEntity(event) {
        const entityId = event.target.dataset.entityId;
        const selectedEntity = this.searchResults.find(result => result.id === entityId);
        
        if (selectedEntity) {
            this.dispatchSelectionEvent(selectedEntity);
        }
    }

    // Data processing methods
    processSearchResults(data) {
        if (!data) return [];
        
        // Handle both single result and array of results
        const results = Array.isArray(data) ? data : [data];
        
        return results.map((item, index) => {
            return {
                id: `result-${index}-${Date.now()}`,
                entityName: this.extractEntityName(item),
                abnNumber: this.extractABNNumber(item),
                abnStatus: this.extractABNStatus(item),
                entityType: this.extractEntityType(item),
                gstStatus: this.extractGSTStatus(item),
                asicNumber: this.extractASICNumber(item),
                mainBusinessLocation: this.extractMainBusinessLocation(item),
                rawData: item
            };
        });
    }

    extractEntityName(item) {
        if (item.other_trading_name && item.other_trading_name.organisation_name) {
            return item.other_trading_name.organisation_name;
        }
        return 'Business Entity';
    }

    extractABNNumber(item) {
        if (item.abn && item.abn.identifier_value) {
            return this.formatABN(item.abn.identifier_value);
        }
        return 'N/A';
    }

    extractABNStatus(item) {
        if (item.entity_status && item.entity_status.entity_status_code) {
            const status = item.entity_status.entity_status_code;
            const effectiveFrom = item.entity_status.effective_from;
            return effectiveFrom ? `${status} from ${this.formatDate(effectiveFrom)}` : status;
        }
        return 'Unknown';
    }

    extractEntityType(item) {
        if (item.entity_type && item.entity_type.entity_description) {
            return item.entity_type.entity_description;
        }
        return 'N/A';
    }

    extractGSTStatus(item) {
        if (item.goods_and_services_tax) {
            const gst = item.goods_and_services_tax;
            if (gst.effective_from && gst.effective_from !== '0001-01-01') {
                return `Registered from ${this.formatDate(gst.effective_from)}`;
            }
        }
        return 'Not Registered';
    }

    extractASICNumber(item) {
        return item.asic_number || null;
    }

    extractMainBusinessLocation(item) {
        // This would typically come from address information in the API response
        // For now, using a placeholder as the sample response doesn't include full address
        return 'VIC 3123'; // This should be extracted from actual address data
    }

    // Utility methods
    formatABN(abn) {
        if (abn && abn.length === 11) {
            return `${abn.substring(0, 2)} ${abn.substring(2, 5)} ${abn.substring(5, 8)} ${abn.substring(8)}`;
        }
        return abn;
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

    // Parent communication methods
    dispatchSearchSuccessEvent(results) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'abnLookupWorkingExample',
                result: results,
                message: `Found ${results.length} result(s)`,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchSelectionEvent(selectedEntity) {
        const selectionEvent = new CustomEvent('entityselected', {
            detail: {
                componentName: 'abnLookupWorkingExample',
                selectedEntity: selectedEntity,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(selectionEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupWorkingExample',
                errorMessage: error,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.searchTerm = '';
        this.searchResults = [];
        this.errorMessage = '';
        this.searchType = 'name';
    }

    @api
    validateComponent() {
        return {
            isValid: this.isValidSearchTerm,
            searchTerm: this.searchTerm,
            searchType: this.searchType
        };
    }

    @api
    performSearch(searchTerm) {
        this.searchTerm = searchTerm;
        this.handleSearch();
    }
}
