import { LightningElement, api, track } from 'lwc';
import searchABN from '@salesforce/apex/abnLookupTestV2Controller.searchABN';

export default class AbnLookupTestV2 extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track searchTerm = '';
    @track searchResults = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track validationError = '';
    @track searchType = '';

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
        return this.isLoading || !this.searchTerm || this.validationError;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0 && !this.isLoading && !this.errorMessage;
    }

    get showNoResults() {
        return !this.hasResults && !this.isLoading && !this.errorMessage && this.searchTerm && this.searchResults.length === 0;
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        this.detectSearchType();
        this.validateInput();
        this.clearMessages();
    }

    handleKeyUp(event) {
        if (event.keyCode === 13) { // Enter key
            this.handleSearch();
        }
    }

    detectSearchType() {
        const term = this.searchTerm.trim();
        
        if (/^\d{11}$/.test(term)) {
            this.searchType = 'ABN';
        } else if (/^\d{9}$/.test(term)) {
            this.searchType = 'ACN';
        } else if (term.length >= 2) {
            this.searchType = 'NAME';
        } else {
            this.searchType = '';
        }
    }

    validateInput() {
        const term = this.searchTerm.trim();
        this.validationError = '';

        if (!term) {
            return;
        }

        if (/^\d+$/.test(term)) {
            if (term.length === 11) {
                // ABN validation
                if (!this.validateABN(term)) {
                    this.validationError = 'Invalid ABN format';
                }
            } else if (term.length === 9) {
                // ACN validation - basic format check
                this.validationError = '';
            } else if (term.length < 9 || term.length > 11) {
                this.validationError = 'ABN must be 11 digits, ACN must be 9 digits';
            }
        } else {
            // Company name validation
            if (term.length < 2) {
                this.validationError = 'Company name must be at least 2 characters';
            }
        }
    }

    validateABN(abn) {
        // Basic ABN validation algorithm
        const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
        let sum = 0;
        
        // Subtract 1 from the first digit
        const firstDigit = parseInt(abn.charAt(0)) - 1;
        sum += firstDigit * weights[0];
        
        // Add the remaining digits multiplied by their weights
        for (let i = 1; i < 11; i++) {
            sum += parseInt(abn.charAt(i)) * weights[i];
        }
        
        return sum % 89 === 0;
    }

    async handleSearch() {
        if (!this.searchTerm || this.validationError || this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.clearMessages();

        try {
            const searchParams = {
                searchTerm: this.searchTerm.trim(),
                searchType: this.searchType
            };

            const result = await searchABN({ searchParams: JSON.stringify(searchParams) });
            
            if (result.success) {
                this.processSearchResults(result.data);
                this.dispatchSuccessEvent(result.data);
            } else {
                this.errorMessage = result.message || 'Search failed. Please try again.';
                this.searchResults = [];
                this.dispatchErrorEvent(this.errorMessage);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.errorMessage = 'An unexpected error occurred. Please try again.';
            this.searchResults = [];
            this.dispatchErrorEvent(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
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
                abnNumber: this.getNestedValue(item, 'abn.identifier_value') || 'N/A',
                entityName: this.getNestedValue(item, 'other_trading_name.organisation_name') || 'N/A',
                abnStatus: this.getNestedValue(item, 'entity_status.entity_status_code') || 'N/A',
                entityType: this.getNestedValue(item, 'entity_type.entity_description') || 'N/A',
                gstStatus: this.getGSTStatus(item),
                businessLocation: this.getNestedValue(item, 'asic_number') || 'N/A',
                rawData: item
            };
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    getGSTStatus(item) {
        const gstData = this.getNestedValue(item, 'goods_and_services_tax');
        if (gstData && gstData.effective_from && gstData.effective_from !== '0001-01-01') {
            return `Registered from ${gstData.effective_from}`;
        }
        return 'Not registered';
    }

    handleSelectBusiness(event) {
        const recordId = event.target.dataset.recordId;
        const selectedBusiness = this.searchResults.find(result => result.id === recordId);
        
        if (selectedBusiness) {
            const selectEvent = new CustomEvent('businessselected', {
                detail: {
                    selectedBusiness: selectedBusiness,
                    componentName: 'abnLookupTestV2',
                    timestamp: new Date().toISOString()
                }
            });
            this.dispatchEvent(selectEvent);
        }
    }

    clearMessages() {
        this.errorMessage = '';
    }

    dispatchSuccessEvent(result) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'abnLookupTestV2',
                result: result,
                message: 'Search completed successfully',
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'abnLookupTestV2',
                errorMessage: typeof error === 'string' ? error : error.message,
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
        this.clearMessages();
        this.validationError = '';
        this.searchType = '';
    }

    @api
    validateComponent() {
        this.validateInput();
        return !this.validationError;
    }

    @api
    performSearch(searchTerm) {
        this.searchTerm = searchTerm;
        this.detectSearchType();
        this.validateInput();
        if (!this.validationError) {
            this.handleSearch();
        }
    }
}
