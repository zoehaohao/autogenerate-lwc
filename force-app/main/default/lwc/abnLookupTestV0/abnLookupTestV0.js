import { LightningElement, api, track } from 'lwc';

export default class AbnLookupTestV0 extends LightningElement {
    @api placeholder = 'Search...';
    @api label = 'Search';
    @api required = false;
    @api messageWhenInvalidValue = 'Please select a valid value';
    
    @track searchTerm = '';
    @track searchResults = [];
    @track showResults = false;
    @track selectedValue;
    @track selectedName;

    // Mock data for testing - replace with actual data source
    mockData = [
        { id: '1', name: 'Test Record 1' },
        { id: '2', name: 'Test Record 2' },
        { id: '3', name: 'Another Record' }
    ];

    handleKeyUp(event) {
        this.searchTerm = event.target.value;
        
        // Minimum 2 characters to search
        if (this.searchTerm.length < 2) {
            this.searchResults = [];
            this.showResults = false;
            return;
        }

        // Filter mock data - replace with actual search logic
        this.searchResults = this.mockData.filter(item => 
            item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
        this.showResults = true;
    }

    handleClick() {
        this.showResults = true;
    }

    handleBlur() {
        // Using setTimeout to allow click events to fire on results first
        window.setTimeout(() => {
            this.showResults = false;
        }, 300);
    }

    handleResultClick(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;
        
        this.selectedValue = selectedId;
        this.selectedName = selectedName;
        this.searchTerm = selectedName;
        this.showResults = false;

        // Dispatch selection event
        this.dispatchEvent(new CustomEvent('selection', {
            detail: {
                id: selectedId,
                name: selectedName
            }
        }));
    }

    @api
    isValid() {
        if (this.required && !this.selectedValue) {
            return false;
        }
        return true;
    }

    @api
    reportValidity() {
        const isValid = this.isValid();
        if (!isValid) {
            // Show error message
            this.dispatchEvent(
                new CustomEvent('error', {
                    detail: {
                        message: this.messageWhenInvalidValue
                    }
                })
            );
        }
        return isValid;
    }

    @api
    reset() {
        this.searchTerm = '';
        this.selectedValue = null;
        this.selectedName = null;
        this.searchResults = [];
        this.showResults = false;
    }
}