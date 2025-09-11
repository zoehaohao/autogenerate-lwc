import { LightningElement, api, track } from 'lwc';

export default class TestRegenerationV3 extends LightningElement {
    @track acnNumber = '';
    
    // Existing tracked properties preserved
    
    handleAcnNumberChange(event) {
        this.acnNumber = event.target.value;
        // Validate ACN number format
        const isValid = /^\d{9}$/.test(this.acnNumber);
        
        // Dispatch change event to parent
        this.dispatchEvent(new CustomEvent('acnchange', {
            detail: {
                value: this.acnNumber,
                isValid: isValid
            },
            bubbles: true,
            composed: true
        }));
    }
    
    // Existing methods preserved
    
    @api
    validate() {
        const allInputs = this.template.querySelectorAll('lightning-input');
        let isValid = true;
        
        allInputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });
        
        return isValid;
    }
}