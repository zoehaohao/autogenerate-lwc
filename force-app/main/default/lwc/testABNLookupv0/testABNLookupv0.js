import { LightningElement, api, track } from 'lwc';
import lookupABN from '@salesforce/apex/testABNLookupv0Controller.lookupABN';

export default class TestABNLookupv0 extends LightningElement {
    @track abnNumber = '';
    @track result = null;
    @track isLoading = false;
    @track errorMessage = '';
    
    get hasResult() {
        return this.result !== null;
    }
    
    get hasError() {
        return this.errorMessage !== '';
    }
    
    get isSearchDisabled() {
        return !this.abnNumber || this.abnNumber.length !== 11 || this.isLoading;
    }
    
    handleAbnChange(event) {
        this.abnNumber = event.target.value.replace(/\D/g, '');
        this.result = null;
        this.errorMessage = '';
    }
    
    async handleLookup() {
        if (this.isSearchDisabled) return;
        
        this.isLoading = true;
        this.result = null;
        this.errorMessage = '';
        
        try {
            const result = await lookupABN({ abnNumber: this.abnNumber });
            if (result.success) {
                this.result = result.data;
            } else {
                this.errorMessage = result.message || 'ABN lookup failed';
            }
        } catch (error) {
            this.errorMessage = 'An error occurred while looking up the ABN';
            console.error('ABN Lookup Error:', error);
        } finally {
            this.isLoading = false;
        }
    }
}