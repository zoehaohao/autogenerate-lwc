import { LightningElement, api, track } from 'lwc';

export default class StrandsTestV10 extends LightningElement {
    @track inputValue = '';
    @track showResult = false;
    @track resultMessage = '';

    handleInputChange(event) {
        this.inputValue = event.target.value;
        this.showResult = false;
    }

    handleSubmit() {
        if (this.inputValue) {
            this.showResult = true;
            this.resultMessage = `Processed value: ${this.inputValue}`;
        }
    }

    @api
    resetComponent() {
        this.inputValue = '';
        this.showResult = false;
        this.resultMessage = '';
    }
}