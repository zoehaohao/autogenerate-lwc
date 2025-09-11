import { LightningElement, api } from 'lwc';

export default class AbnLookupTestV12 extends LightningElement {
    @api label;
    @api placeholder = 'Search...';
    @api required = false;
    @api searchTerm = '';
    @api records = [];
    @api isLoading = false;
    @api additionalText = '';

    handleAdditionalTextChange(event) {
        this.additionalText = event.target.value;
        // Dispatch an event with the new value
        this.dispatchEvent(new CustomEvent('textchange', {
            detail: { value: this.additionalText }
        }));
    }

    handleKeyUp(event) {
        const searchTerm = event.target.value;
        this.searchTerm = searchTerm;
        // Dispatch the search event
        this.dispatchEvent(new CustomEvent('search', {
            detail: { searchTerm }
        }));
    }

    handleFocus() {
        // Dispatch focus event
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleBlur() {
        // Add a small delay to allow the selection handler to fire first
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('blur'));
        }, 300);
    }

    handleSelection(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedRecord = this.records.find(record => record.Id === selectedId);
        
        // Dispatch the selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: { selectedRecord }
        }));
    }

    get getContainerClass() {
        let css = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        if (this.records.length > 0) {
            css += ' slds-is-open';
        }
        return css;
    }
}