import { LightningElement, track } from 'lwc';

export default class StrandsTestV6 extends LightningElement {
    @track inputText = '';
    @track processedText = '';
    @track showChild = false;

    handleInputChange(event) {
        this.inputText = event.target.value;
    }

    handleClick() {
        if (this.inputText) {
            this.processedText = `Processed: ${this.inputText.toUpperCase()}`;
            this.showChild = true;
        }
    }

    handleChildEvent(event) {
        const message = event.detail;
        // eslint-disable-next-line no-console
        console.log('Received from child:', message);
    }
}