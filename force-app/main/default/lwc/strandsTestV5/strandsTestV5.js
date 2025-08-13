import { LightningElement, api, track } from 'lwc';

export default class StrandsTestV5 extends LightningElement {
    @track inputValue = '';
    @track displayMessage = '';

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    handleSubmit() {
        if (this.inputValue) {
            this.displayMessage = `Submitted value: ${this.inputValue}`;
        } else {
            this.displayMessage = 'Please enter a value';
        }
    }
}