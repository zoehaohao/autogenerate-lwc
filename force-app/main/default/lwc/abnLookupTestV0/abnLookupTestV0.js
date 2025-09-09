import { LightningElement, api, track } from 'lwc';

export default class AbnLookupTestV0 extends LightningElement {
    @api label = 'Search';
    @api placeholder = 'Search...';
    @api options = [];
    
    @track searchTerm = '';
    @track isExpanded = false;

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
            this.isExpanded ? 'slds-is-open' : ''
        }`;
    }

    get listboxClass() {
        return `slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid ${
            this.isExpanded ? 'slds-show' : 'slds-hide'
        }`;
    }

    get filteredOptions() {
        if (!this.searchTerm) {
            return this.options;
        }
        const loweredSearchTerm = this.searchTerm.toLowerCase();
        return this.options.filter(option =>
            option.label.toLowerCase().includes(loweredSearchTerm)
        );
    }

    handleKeyUp(event) {
        this.searchTerm = event.target.value;
        this.isExpanded = true;
        this.dispatchEvent(new CustomEvent('search', {
            detail: {
                searchTerm: this.searchTerm
            }
        }));
    }

    handleFocus() {
        this.isExpanded = true;
    }

    handleBlur() {
        // Use setTimeout to allow click events to fire before closing
        setTimeout(() => {
            this.isExpanded = false;
        }, 300);
    }

    handleOptionSelect(event) {
        const selectedValue = event.currentTarget.dataset.value;
        const selectedOption = this.options.find(option => option.value === selectedValue);
        
        if (selectedOption) {
            this.searchTerm = selectedOption.label;
            this.isExpanded = false;
            
            this.dispatchEvent(new CustomEvent('select', {
                detail: {
                    value: selectedValue,
                    label: selectedOption.label
                }
            }));
        }
    }

    @api
    clearSelection() {
        this.searchTerm = '';
        this.isExpanded = false;
    }
}