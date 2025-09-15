import { LightningElement, api, track } from 'lwc';

export default class TestRegenerationV6 extends LightningElement {
    @track inputValue = '';
    
    handleInputChange(event) {
        this.inputValue = event.target.value;
    }
    
    handleSubmit() {
        // Dispatch custom event with input value
        const submitEvent = new CustomEvent('submit', {
            detail: {
                value: this.inputValue
            }
        });
        this.dispatchEvent(submitEvent);
        
        // Reset input
        this.inputValue = '';
    }
}